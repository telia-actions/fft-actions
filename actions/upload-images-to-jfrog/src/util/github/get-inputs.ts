import { getInput } from '@actions/core';
import type { Inputs } from '@src/types';

export function getInputs(): Inputs {
  const apps = JSON.parse(getInput('apps'));
  const remoteTag = getInput('remoteTag');
  const localTag = getInput('localTag');
  const registryUrl = getInput('registryUrl');
  const actionIfMissing = getInput('actionIfMissing');

  return {
    apps,
    remoteTag,
    localTag,
    registryUrl,
    actionIfMissing,
  };
}
