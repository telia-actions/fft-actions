import { getInput, setOutput } from '@actions/core';
import { createPayload } from '@src/libs/payload';
import {
  getAttachmentsData,
  getJobsData,
  getPullRequestContext,
  getWorkflowContext,
} from '@src/utils/github-client';

export const run = async (): Promise<void> => {
  try {
    const token = getInput('token');
    const workflowContext = getWorkflowContext();
    const jobsData = await getJobsData(token, workflowContext.runId);
    const attachmentsData = await getAttachmentsData(token, workflowContext.runId);
    if (workflowContext.pullNumber) {
      const pullRequestContext = await getPullRequestContext(token, workflowContext.pullNumber);
      const payload = createPayload(workflowContext, jobsData, attachmentsData, pullRequestContext);
      setOutput('payload', payload);
    } else {
      const payload = createPayload(workflowContext, jobsData, attachmentsData);
      setOutput('payload', payload);
    }
  } catch (error) {
    setOutput('payload', 'Failed to generate slack message payload - please contact @fft');
  }
};
