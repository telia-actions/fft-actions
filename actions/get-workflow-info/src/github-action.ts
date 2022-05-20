import { getInput, setFailed, setOutput } from '@actions/core';
import { getWorkflowInfo } from '@src/libs/workflow-info';

export const run = async (): Promise<void> => {
  try {
    const token = getInput('token');
    const fail_if_absent = getInput('fail_if_absent');

    const workflowInfo = await getWorkflowInfo(token);

    for (const it of JSON.parse(fail_if_absent)) {
      if (!(it in workflowInfo)) {
        throw new Error(`${it} key does not exists in workflowInfo`);
      }
    }

    setOutput('author_email', workflowInfo.author_email);
    setOutput('environment', workflowInfo.environment);
  } catch (error: any) {
    setFailed(error.message);
  }
};
