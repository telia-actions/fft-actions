import { context } from '@actions/github';
import {
  getArtifact,
  getAttachmentsData,
  getJobsData,
  getPullRequestData,
} from '@src/utils/github-client';
import { AttachmentsData, JobsData, PullRequestData, WorkflowData } from './types';
import type { WorkflowRunEvent } from '@octokit/webhooks-types';
import type {
  ListJobsForWorkflowRun,
  ListWorkflowRunArtifacts,
  PullRequest,
} from '@src/utils/github-client/types';
import { GithubStatus } from '@src/enums';
import { readFile, writeFile } from '@src/utils/file-client';
import { unzipArtifact } from '@src/utils/exec-client';

interface WorkflowInfo {
  environment: string;
  author_email: string;
}

export const getWorkflowContext = async (token: string): Promise<WorkflowData> => {
  const workflowRunContext = context.payload as WorkflowRunEvent;
  const pullRequestNumber =
    workflowRunContext.workflow_run.pull_requests.length > 0
      ? workflowRunContext.workflow_run.pull_requests[0].number
      : 0;
  return pullRequestNumber
    ? getContextWithPullRequest(token, pullRequestNumber, workflowRunContext)
    : getContextWithoutPullRequest(token, workflowRunContext);
};

const getContextWithPullRequest = async (
  token: string,
  pullRequestNumber: number,
  workflowRunContext: WorkflowRunEvent
): Promise<WorkflowData> => {
  const pullRequestData = await getPullRequestData(token, pullRequestNumber);
  const workflowData = await getBaseContext(token, workflowRunContext);
  return {
    ...workflowData,
    pullRequest: mapPullRequestData(pullRequestData),
  };
};

const getContextWithoutPullRequest = async (
  token: string,
  workflowRunContext: WorkflowRunEvent
): Promise<WorkflowData> => {
  const workflowData = await getBaseContext(token, workflowRunContext);
  return { ...workflowData, pullRequest: undefined };
};

const getBaseContext = async (
  token: string,
  workflowRunContext: WorkflowRunEvent
): Promise<Omit<WorkflowData, 'pullRequest'>> => {
  const jobsData = await getJobsData(token, workflowRunContext.workflow_run.id);
  const attachmentsData = await getAttachmentsData(token, workflowRunContext.workflow_run.id);
  const workflowInfoArtifactId = getWorkflowInfoAttachmentId(attachmentsData);
  const workflowInfo = workflowInfoArtifactId
    ? await getWorkflowInfo(token, workflowInfoArtifactId)
    : addMissingWorkflowInfoProperties({});
  return {
    attachmentsIds: mapAttachmentsData(attachmentsData),
    checkSuiteId: workflowRunContext.workflow_run.check_suite_id,
    conclusion: workflowRunContext.workflow_run.conclusion,
    environment: workflowInfo.environment,
    jobsOutcome: mapJobsData(jobsData),
    name: workflowRunContext.workflow_run.name,
    repository: {
      name: workflowRunContext.repository.name,
      url: workflowRunContext.repository.html_url,
    },
    runId: workflowRunContext.workflow_run.id,
    sha: workflowRunContext.workflow_run.head_sha.substring(0, 8),
    url: workflowRunContext.workflow_run.html_url,
    author_email: workflowInfo.author_email,
  };
};

const mapAttachmentsData = (attachments: ListWorkflowRunArtifacts): AttachmentsData => {
  const map = new Map<string, keyof AttachmentsData>([
    ['build-logs', 'buildLogsArtifactId'],
    ['test-logs', 'testLogsArtifactId'],
    ['workflowInfo', 'workflowInfoArtifactId'],
  ]);
  return attachments.artifacts.reduce(
    (acc, artifact) => {
      const mappedValue = map.get(artifact.name);
      if (mappedValue) acc[mappedValue] = artifact.id;
      return acc;
    },
    {
      buildLogsArtifactId: 0,
      testLogsArtifactId: 0,
      workflowInfoArtifactId: 0,
    }
  );
};

const getWorkflowInfoAttachmentId = (attachments: ListWorkflowRunArtifacts): number => {
  const workflowInfoAttachment = attachments.artifacts.find(
    (artifact) => artifact.name === 'workflowInfo'
  );
  return workflowInfoAttachment ? workflowInfoAttachment.id : 0;
};

const mapPullRequestData = (pullRequest: PullRequest): PullRequestData => {
  return { title: pullRequest.title, url: pullRequest.html_url, number: pullRequest.number };
};

const mapJobsData = (workflowJobs: ListJobsForWorkflowRun): JobsData => {
  return workflowJobs.jobs.reduce<JobsData>(
    (acc, job) => {
      const isDeployJob = job.name.startsWith('deploy');
      if (job.conclusion === GithubStatus.FAILURE) {
        if (!isDeployJob && job.steps) {
          const failedStep = job.steps.find((step) => step.conclusion === GithubStatus.FAILURE);
          if (failedStep) {
            acc.failedJobSteps.push(failedStep.name);
          }
        }
        if (isDeployJob) acc.failureDeployCount = acc.failureDeployCount + 1;
      } else if (isDeployJob && job.conclusion === GithubStatus.SUCCESS) {
        acc.successDeployCount = acc.successDeployCount + 1;
      }
      return acc;
    },
    {
      successDeployCount: 0,
      failureDeployCount: 0,
      failedJobSteps: [],
    }
  );
};

const getArtifactContents = async (
  token: string,
  artifactId: number
): Promise<Record<string, unknown>> => {
  try {
    const infoArtifact = await getArtifact(token, artifactId);
    const fileName = 'workflowInfo';
    writeFile(`${fileName}.zip`, Buffer.from(infoArtifact as ArrayBuffer));
    await unzipArtifact(fileName);
    return JSON.parse(readFile(`${fileName}.json`));
  } catch {
    return {};
  }
};
const addMissingWorkflowInfoProperties = (partialInfo: Record<string, unknown>): WorkflowInfo => {
  return {
    environment: 'Unknown',
    author_email: 'Unknown',
    ...partialInfo,
  };
};
const getWorkflowInfo = async (token: string, artifactId: number): Promise<WorkflowInfo> => {
  const workflowInfo = await getArtifactContents(token, artifactId);
  return addMissingWorkflowInfoProperties(workflowInfo);
};
