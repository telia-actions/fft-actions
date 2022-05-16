import { context, getOctokit } from '@actions/github';
import type {
  DownloadArtifact,
  ListWorkflowRunArtifacts,
} from './types';

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
