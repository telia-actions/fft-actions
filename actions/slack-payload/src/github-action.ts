import { getInput, setOutput } from '@actions/core';
import { createErrorPayload, createPayload } from '@src/libs/slack-payload';
import { getWorkflowContext } from '@src/libs/workflow-context';

export const run = async (): Promise<void> => {
  try {
    const token = getInput('token');
    const environment = getInput('environment');

    const workflowContext = await getWorkflowContext(token);
    const payload = createPayload(workflowContext, environment);
    setOutput('payload', payload);
  } catch (error) {
    const errorPayload = createErrorPayload(error);
    setOutput('payload', errorPayload);
  }
};
