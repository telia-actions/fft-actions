import { getInput, setOutput, setFailed } from '@actions/core';
import { getWorkflowInfo } from '@src/libs/workflow-info';

export const run = async (): Promise<void> => {
  try {
    const token = getInput('token');
    const fail_if_absent = getInput('fail_if_absent');
    const fail_if_absent_array = fail_if_absent.replace(/\[|\]|\s+/g,'').split(',');

    const workflowInfo = await getWorkflowInfo(token);

    console.log('fail_if_absent_array ', fail_if_absent_array);
    console.log('workflowInfo ', workflowInfo)

    fail_if_absent_array.forEach(it => {
      if (!(it in workflowInfo)) {
        throw new Error(`${it} key does not exists`);
      }
    });

    setOutput('author_email', workflowInfo.author_email);
    setOutput('environment', workflowInfo.environment);
  } catch (error: any) {
    setFailed(error.message);
  }
};
