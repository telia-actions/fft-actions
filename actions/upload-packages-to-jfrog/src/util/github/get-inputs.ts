import { getInput } from '@actions/core';
import type { Inputs } from '@src/types';

export function getInputs(): Inputs {
  const rushProjects = JSON.parse(getInput('rush-projects'));
  const repositoryUrl = getInput('repository-url');
  const username = getInput('username');
  const password = getInput('password');
  const buildIdentifier = getInput('build-identifier');

  return {
    rushProjects,
    repositoryUrl,
    username,
    password,
    buildIdentifier,
  };
}
