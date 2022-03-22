import { getInput, setOutput } from '@actions/core';
import { createPullRequestPayload } from '@src/libs/pull-request-payload';
import {
  getDeployedPackagesCount,
  getPullRequestContext,
  getPullRequestNumber,
  getWorkflowData,
} from '@src/utils/github';

export const run = async (): Promise<void> => {
  try {
    const token = getInput('token');
    const pullRequestNumber = getPullRequestNumber();
    const deployedPackagesCount = await getDeployedPackagesCount(token);
    const workflowData = await getWorkflowData(token);
    if (pullRequestNumber !== 0) {
      const context = getPullRequestContext();
      const payload = createPullRequestPayload(context, workflowData, deployedPackagesCount);
      setOutput('payload', payload);
    }
  } catch (error) {
    setOutput('payload', 'Failed to generate slack message payload - please contact @fft');
  }
};
