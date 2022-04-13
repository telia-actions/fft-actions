import { context, getOctokit } from '@actions/github';
import type {
  DownloadArtifact,
  ListJobsForWorkflowRun,
  ListWorkflowRunArtifacts,
  PullRequest,
} from './types';

export const getPullRequestData = async (
  token: string,
  pullNumber: number
): Promise<PullRequest> => {
  const client = getOctokit(token);
  const pullRequest = await client.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pullNumber,
  });
  return pullRequest.data;
};

export const getAttachmentsData = async (
  token: string,
  runId: number
): Promise<ListWorkflowRunArtifacts> => {
  const client = getOctokit(token);
  const attachments = await client.rest.actions.listWorkflowRunArtifacts({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: runId,
  });
  return attachments.data;
};

export const getJobsData = async (
  token: string,
  runId: number
): Promise<ListJobsForWorkflowRun> => {
  const client = getOctokit(token);
  const workflow = await client.rest.actions.listJobsForWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: runId,
  });
  return workflow.data;
};

export const getArtifact = async (token: string, artifactId: number): Promise<DownloadArtifact> => {
  const client = getOctokit(token);
  const artifact = await client.rest.actions.downloadArtifact({
    owner: context.repo.owner,
    repo: context.repo.repo,
    artifact_id: artifactId,
    archive_format: 'zip',
  });
  return artifact.data;
};
