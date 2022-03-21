import { getInput, setOutput } from '@actions/core';
import { createPullRequestPayload } from '@src/libs/pull-request-payload';
import {
  getDeployedPackages,
  getPullRequestContext,
  getPullRequestNumber,
  getWorkflowData,
} from '@src/utils/github';

export const run = async (): Promise<void> => {
  try {
    const token = getInput('token');
    const pullRequestNumber = getPullRequestNumber();
    const deployedPackages = await getDeployedPackages(token);
    const workflowData = await getWorkflowData(token);
    if (pullRequestNumber !== 0) {
      const context = getPullRequestContext();
      const payload = createPullRequestPayload(context, workflowData, deployedPackages);
      setOutput('payload', payload);
    }
  } catch (error) {
    setOutput('payload', 'Failed to generate slack message payload - please contact @fft');
  }
};
