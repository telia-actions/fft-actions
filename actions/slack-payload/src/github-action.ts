import { getInput, setOutput } from '@actions/core';
import { createPayload } from '@src/libs/payload';
import {
  getDeployedPackagesCount,
  getPullRequestContext,
  getWorkflowContext,
} from '@src/utils/github';

export const run = async (): Promise<void> => {
  try {
    const token = getInput('token');
    const workflowContext = getWorkflowContext();
    const deployedPackagesCount = await getDeployedPackagesCount(token, workflowContext.runId);
    if (workflowContext.pullNumber) {
      const pullRequestContext = await getPullRequestContext(token, workflowContext.pullNumber);
      const payload = createPayload(workflowContext, deployedPackagesCount, pullRequestContext);
      setOutput('payload', payload);
    } else {
      const payload = createPayload(workflowContext, deployedPackagesCount);
      setOutput('payload', payload);
    }
  } catch (error) {
    setOutput('payload', 'Failed to generate slack message payload - please contact @fft');
  }
};
