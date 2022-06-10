import { getInput, setFailed, setOutput } from '@actions/core';
import { EnvironmentConfig } from './types';
import { readJsonWithComments } from '@src/util/json-client';

export const run = (): void => {
  try {
    const appName = getInput('app-name');
    const configDir = getInput('config-dir');
    const environment = getInput('environment');

    const configFilePath = `${configDir}/${environment}.json`;

    const environmentConfig: EnvironmentConfig = readJsonWithComments(configFilePath);

    setOutput('config', environmentConfig);

    if (appName) {
      const appConfig = environmentConfig.apps.find((app) => app.name === appName);

      setOutput('app', appConfig);
    }
  } catch (error: any) {
    setFailed(error.message);
  }
};
