import { getInput, setOutput } from '@actions/core';
import { createPayload } from '@src/libs/payload';
import {
  downloadArtifact,
  getAttachmentsData,
  getJobsData,
  getPullRequestContext,
  getWorkflowContext,
} from '@src/utils/github-client';
import { unzipArtifact } from '@src/utils/tar/archive-artifact';
import { isFileExists, readFile } from './utils/file-client';

export const run = async (): Promise<void> => {
  try {
    const token = getInput('token');
    const workflowContext = getWorkflowContext();
    const jobsData = await getJobsData(token, workflowContext.runId);
    const attachmentsData = await getAttachmentsData(token, workflowContext.runId);
    console.log(attachmentsData.environmentArtifactId);
    await downloadArtifact(token, attachmentsData.environmentArtifactId);
    let environment = '';
    if (isFileExists('./environment.txt')) {
      await unzipArtifact('./environment.txt');
      environment = readFile('./environment.txt');
    }
    console.log(environment);
    if (workflowContext.pullNumber) {
      const pullRequestContext = await getPullRequestContext(token, workflowContext.pullNumber);
      const payload = createPayload(
        environment,
        workflowContext,
        jobsData,
        attachmentsData,
        pullRequestContext
      );
      setOutput('payload', payload);
    } else {
      const payload = createPayload(environment, workflowContext, jobsData, attachmentsData);
      setOutput('payload', payload);
    }
  } catch (error) {
    setOutput('payload', 'Failed to generate slack message payload - please contact @fft');
  }
};
