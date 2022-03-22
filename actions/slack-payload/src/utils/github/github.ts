import { context, getOctokit } from '@actions/github';
import type { WorkflowRunEvent } from '@octokit/webhooks-types';
import { GithubStatus } from '@src/enums';
import type { PullRequestData, WorkflowData } from './types';

export const getWorkflowContext = (): WorkflowData => {
  const workflowRunContext = context.payload as WorkflowRunEvent;
  // eslint-disable-next-line no-console
  console.log(workflowRunContext.workflow_run.pull_requests);
  return {
    name: workflowRunContext.workflow_run.name,
    conclusion: workflowRunContext.workflow_run.conclusion,
    url: workflowRunContext.workflow_run.html_url,
    artifactsUrls: workflowRunContext.workflow_run.artifacts_url,
    runId: workflowRunContext.workflow_run.id,
    sha: workflowRunContext.workflow_run.head_sha.substring(0, 8),
    pullNumber: workflowRunContext.workflow_run.pull_requests[0].number,
    repository: {
      url: workflowRunContext.repository.html_url,
      name: workflowRunContext.repository.name,
    },
  };
};

export const getDeployedPackagesCount = async (token: string, runId: number): Promise<number> => {
  const client = getOctokit(token);
  const workflow = await client.rest.actions.listJobsForWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: runId,
  });
  return workflow.data.jobs.reduce<number>((acc, job) => {
    const isDeployJob = job.name.startsWith('deploy');
    if (isDeployJob && job.conclusion === GithubStatus.SUCCESS) {
      acc = acc + 1;
    }
    return acc;
  }, 0);
};

export const getPullRequestContext = async (
  token: string,
  pullNumber: number
): Promise<PullRequestData> => {
  const client = getOctokit(token);
  const pullRequest = await client.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pullNumber,
  });
  return { number: pullNumber, title: pullRequest.data.title, url: pullRequest.data.html_url };
};
