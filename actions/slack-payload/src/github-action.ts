import { getInput, setOutput } from '@actions/core';
import { createPayload } from '@src/libs/slack-payload';
import { getWorkflowContext } from '@src/libs/workflow-context';

export const run = async (): Promise<void> => {
  try {
    const token = getInput('token');
    const workflowContext = await getWorkflowContext(token);
    const payload = createPayload(workflowContext);
    setOutput('payload', payload);
  } catch (error) {
    setOutput('payload', 'Failed to generate slack message payload - please contact @fft');
  }
};
