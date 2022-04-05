import { getInput, setOutput } from '@actions/core';
import { createPayload } from '@src/libs/payload';
import { getWorkflowContext } from '@src/utils/github-client';

export const run = async (): Promise<void> => {
  try {
    const token = getInput('token');
    const workflowContext = await getWorkflowContext(token);
    const payload = createPayload(workflowContext);
    console.log(payload);
    setOutput('payload', payload);
  } catch (error) {
    setOutput('payload', 'Failed to generate slack message payload - please contact @fft');
  }
};
