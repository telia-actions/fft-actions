import { context } from '@actions/github';
import {
  getArtifact,
  getAttachmentsData,
} from '@src/utils/github-client';
import type { WorkflowRunEvent } from '@octokit/webhooks-types';
import type {
  ListWorkflowRunArtifacts,
} from '@src/utils/github-client/types';
import { readFile, writeFile } from '@src/utils/file-client';
import { unzipArtifact } from '@src/utils/exec-client';

export const getWorkflowInfo = async (token: string): Promise<Record<string, unknown>> => {
  const workflowRunContext = context.payload as WorkflowRunEvent;
  const attachmentsData = await getAttachmentsData(token, workflowRunContext.workflow_run.id);
  const workflowInfoArtifactId = getWorkflowInfoAttachmentId(attachmentsData);
  
  return workflowInfoArtifactId ? await getArtifactContents(token, workflowInfoArtifactId) : {};
};

const getWorkflowInfoAttachmentId = (attachments: ListWorkflowRunArtifacts): number => {
  const workflowInfoAttachment = attachments.artifacts.find(
    (artifact) => artifact.name === 'workflowInfo'
  );
  return workflowInfoAttachment ? workflowInfoAttachment.id : 0;
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
