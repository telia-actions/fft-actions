import { context } from '@actions/github';
import { getAttachmentsData, getJobsData, getPullRequestData } from '@src/utils/github-client';
import { AttachmentsData, JobsData, PullRequestData, WorkflowData } from './types';
import type { WorkflowRunEvent } from '@octokit/webhooks-types';
import type {
  ListJobsForWorkflowRun,
  ListWorkflowRunArtifacts,
  PullRequest,
} from '@src/utils/github-client/types';
import { GithubStatus } from '@src/enums';

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
  return {
    attachmentsIds: mapAttachmentsData(attachmentsData),
    checkSuiteId: workflowRunContext.workflow_run.check_suite_id,
    conclusion: workflowRunContext.workflow_run.conclusion,
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
