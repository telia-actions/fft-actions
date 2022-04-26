import { getInput, setFailed, setOutput } from '@actions/core';
import { readJsonWithComments } from '@src/util/json-client';
import { PreviewEnvConfig } from './types';

export const run = (): void => {
  try {
    const configFilePath = getInput('configFilePath');
    const staticAppName = getInput('staticAppName');

    const previewEnvConfig: PreviewEnvConfig = readJsonWithComments(configFilePath);

    setOutput('config', previewEnvConfig);

    if (staticAppName) {
      const appConfig = previewEnvConfig.apps.find((app) => app.name === staticAppName);

      setOutput('staticApp', appConfig);
    }
  } catch (error: any) {
    setFailed(error.message);
  }
};
