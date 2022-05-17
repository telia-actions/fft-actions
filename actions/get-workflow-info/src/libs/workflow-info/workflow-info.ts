import { context } from '@actions/github';
import {
  getArtifact,
  getAttachmentsData,
} from '@src/utils/github-client';
import { WorkflowInfo } from './types';
import type { WorkflowRunEvent } from '@octokit/webhooks-types';
import type {
  ListWorkflowRunArtifacts,
} from '@src/utils/github-client/types';
import { readFile, writeFile } from '@src/utils/file-client';
import { unzipArtifact } from '@src/utils/exec-client';

export const getWorkflowInfo = async (token: string): Promise<WorkflowInfo> => {
  const workflowRunContext = context.payload as WorkflowRunEvent;
  const attachmentsData = await getAttachmentsData(token, workflowRunContext.workflow_run.id);
  const workflowInfoArtifactId = getWorkflowInfoAttachmentId(attachmentsData);
  
  const workflowInfo = workflowInfoArtifactId ? await getArtifactContents(token, workflowInfoArtifactId) : {};
  return addMissingWorkflowInfoProperties(workflowInfo);
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
const addMissingWorkflowInfoProperties = (partialInfo: Record<string, unknown>): WorkflowInfo => {
  return {
    environment: 'Unknown',
    author_email: 'Unknown',
    ...partialInfo,
  };
};
