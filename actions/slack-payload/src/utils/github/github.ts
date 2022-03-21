import { context, getOctokit } from '@actions/github';
import { PullRequestEvent, PushEvent } from '@octokit/webhooks-definitions/schema';
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

export const getDeployedPackages = async (token: string): Promise<string[]> => {
  const workflow = await listJobsForWorkflowRun(token);
  return workflow.jobs.reduce<string[]>((acc, job) => {
    const isDeployJob = job.name.startsWith('deploy');
    if (isDeployJob && job.conclusion === GithubStatus.SUCCESS) {
      acc.push(job.name);
    }
    return acc;
  }, []);
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
