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
  const pullRequestNumber = workflowRunContext.workflow_run.pull_requests[0].number;

  const attachmentsData = await getAttachmentsData(token, workflowRunContext.workflow_run.id);
  const jobsData = await getJobsData(token, workflowRunContext.workflow_run.id);
  const pullRequestData = pullRequestNumber
    ? await getPullRequestData(token, pullRequestNumber)
    : undefined;

  const attachmentsIds = mapAttachmentsData(attachmentsData);
  const environment = await getEnvironment(
    token,
    pullRequestNumber,
    attachmentsIds.environmentArtifactId
  );
  return {
    attachmentsIds,
    checkSuiteId: workflowRunContext.workflow_run.check_suite_id,
    conclusion: workflowRunContext.workflow_run.conclusion,
    environment,
    jobsOutcome: mapJobsData(jobsData),
    name: workflowRunContext.workflow_run.name,
    pullRequest: mapPullRequestData(pullRequestData),
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

const getEnvironment = async (
  token: string,
  pullRequestNumber: number,
  environmentArtifactId: number
): Promise<string> => {
  if (pullRequestNumber) return `preview-${pullRequestNumber}`;

  const environmentArtifact = await getArtifact(token, environmentArtifactId);
  const fileName = 'environment';

  writeFile(`${fileName}.zip`, Buffer.from(environmentArtifact as ArrayBuffer));
  await unzipArtifact(fileName);
  return readFile(`${fileName}.txt`);
};
