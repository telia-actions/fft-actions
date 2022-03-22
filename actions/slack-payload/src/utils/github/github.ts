import { context, getOctokit } from '@actions/github';
import type { PullRequestEvent, PushEvent } from '@octokit/webhooks-types';
import { GithubStatus } from '@src/enums';
import type { ListJobsForWorkflowRun, WorkflowData } from './types';

const listJobsForWorkflowRun = async (token: string): Promise<ListJobsForWorkflowRun> => {
  const client = getOctokit(token);
  const workflowJobs = await client.rest.actions.listJobsForWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: context.runId,
  });
  return workflowJobs.data;
};

export const getPullRequestNumber = (): number => {
  return context.payload.pull_request?.number || 0;
};

export const getRunId = (): number => {
  return context.runId;
};

export const getPullRequestContext = (): PullRequestEvent => {
  return context.payload as PullRequestEvent;
};

export const getPushContext = (): PushEvent => {
  return context.payload as PushEvent;
};

export const getDeployedPackagesCount = async (token: string): Promise<number> => {
  const workflow = await listJobsForWorkflowRun(token);
  return workflow.jobs.reduce<number>((acc, job) => {
    // eslint-disable-next-line no-console
    console.log(job);
    const isDeployJob = job.name.startsWith('deploy');
    if (isDeployJob && job.conclusion === GithubStatus.SUCCESS) {
      acc = acc + 1;
    }
    return acc;
  }, 0);
};

export const getWorkflowData = async (token: string): Promise<WorkflowData> => {
  const client = getOctokit(token);
  const workflow = await client.rest.actions.getWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: context.runId,
  });
  return {
    name: workflow.data.name,
    status: workflow.data.status,
    runId: context.runId,
  };
};
