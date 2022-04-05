import { context, getOctokit } from '@actions/github';
import type { WorkflowRunEvent } from '@octokit/webhooks-types';
import { GithubStatus } from '@src/enums';
import type { AttachmentsData, JobsData, PullRequestData, WorkflowData } from './types';

export const getWorkflowContext = (): WorkflowData => {
  const workflowRunContext = context.payload as WorkflowRunEvent;
  return {
    name: workflowRunContext.workflow_run.name,
    conclusion: workflowRunContext.workflow_run.conclusion,
    url: workflowRunContext.workflow_run.html_url,
    runId: workflowRunContext.workflow_run.id,
    sha: workflowRunContext.workflow_run.head_sha.substring(0, 8),
    pullNumber: workflowRunContext.workflow_run.pull_requests[0].number,
    repository: {
      url: workflowRunContext.repository.html_url,
      name: workflowRunContext.repository.name,
    },
  };
};

export const getJobsData = async (token: string, runId: number): Promise<JobsData> => {
  const client = getOctokit(token);
  const workflow = await client.rest.actions.listJobsForWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: runId,
  });
  return workflow.data.jobs.reduce<JobsData>(
    (acc, job) => {
      const isDeployJob = job.name.startsWith('deploy');
      if (job.conclusion === GithubStatus.FAILURE) {
        acc.failedJobs.push(job.name);
        if (isDeployJob) acc.failureDeployCount = acc.failureDeployCount + 1;
      } else if (isDeployJob && job.conclusion === GithubStatus.SUCCESS) {
        acc.successDeployCount = acc.successDeployCount + 1;
      }
      return acc;
    },
    {
      successDeployCount: 0,
      failureDeployCount: 0,
      failedJobs: [],
    }
  );
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

export const getAttachmentsData = async (
  token: string,
  runId: number
): Promise<AttachmentsData> => {
  const client = getOctokit(token);
  const attachments = await client.rest.actions.listWorkflowRunArtifacts({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: runId,
  });
  return attachments.data.artifacts.reduce(
    (acc, artifact) => {
      switch (artifact.name) {
        case 'build-logs':
          acc.buildLogsUrl = artifact.archive_download_url;
          break;
        case 'test-logs':
          acc.testLogsUrl = artifact.archive_download_url;
          break;
        case 'environment':
          acc.environmentArtifactId = artifact.id;
          break;
        default:
          break;
      }
      return acc;
    },
    {
      buildLogsUrl: '',
      testLogsUrl: '',
      environmentArtifactId: 0,
    }
  );
};

export const downloadArtifact = async (token: string, artifactId: number): Promise<Buffer> => {
  const client = getOctokit(token);
  const zip = await client.rest.actions.downloadArtifact({
    owner: context.repo.owner,
    repo: context.repo.repo,
    artifact_id: artifactId,
    archive_format: 'zip',
  });
  console.log(zip.data);
  return Buffer.from(zip.data as ArrayBuffer);
};
