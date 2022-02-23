import core from '@actions/core';
import type { Inputs } from '@src/types';

export function getInputs(): Inputs {
  const rushProjects = JSON.parse(core.getInput('rush-projects'));
  const repositoryUrl = core.getInput('repository-url');
  const apiKey = core.getInput('api-key');
  const buildIdentifier = core.getInput('build-identifier');

  return {
    rushProjects,
    repositoryUrl,
    apiKey,
    buildIdentifier,
  };
}
