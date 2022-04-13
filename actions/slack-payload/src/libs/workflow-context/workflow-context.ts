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
  const environmentArtifactId = getEnvironmentAttachmentId(attachmentsData);
  const environment = environmentArtifactId
    ? await getEnvironment(token, environmentArtifactId)
    : 'Unknown';
  return {
    attachmentsIds: mapAttachmentsData(attachmentsData),
    checkSuiteId: workflowRunContext.workflow_run.check_suite_id,
    conclusion: workflowRunContext.workflow_run.conclusion,
    environment,
    jobsOutcome: mapJobsData(jobsData),
    name: workflowRunContext.workflow_run.name,
    repository: {
      name: workflowRunContext.repository.name,
      url: workflowRunContext.repository.html_url,
    },
    runId: workflowRunContext.workflow_run.id,
    sha: workflowRunContext.workflow_run.head_sha.substring(0, 8),
    url: workflowRunContext.workflow_run.html_url,
  };
};

const mapAttachmentsData = (attachments: ListWorkflowRunArtifacts): AttachmentsData => {
  const map = new Map<string, keyof AttachmentsData>([
    ['build-logs', 'buildLogsArtifactId'],
    ['test-logs', 'testLogsArtifactId'],
    ['environment', 'environmentArtifactId'],
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
      environmentArtifactId: 0,
    }
  );
};

const getEnvironmentAttachmentId = (attachments: ListWorkflowRunArtifacts): number => {
  const environmentAttachment = attachments.artifacts.find(
    (artifact) => artifact.name === 'environment'
  );
  return environmentAttachment ? environmentAttachment.id : 0;
};

const mapPullRequestData = (pullRequest: PullRequest | undefined): PullRequestData | undefined => {
  if (!pullRequest) return;
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

const getEnvironment = async (token: string, environmentArtifactId: number): Promise<string> => {
  try {
    const environmentArtifact = await getArtifact(token, environmentArtifactId);
    const fileName = 'environment';

    writeFile(`${fileName}.zip`, Buffer.from(environmentArtifact as ArrayBuffer));
    await unzipArtifact(fileName);

    return readFile(`${fileName}.txt`);
  } catch (error) {
    return 'Unknown';
  }
};
