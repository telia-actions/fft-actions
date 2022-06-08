import { setFailed, getInput } from '@actions/core';
import { AppsInput } from '@src/types';
import { uploadImages } from './lib';

export async function run(): Promise<void> {
  try {
    const apps: AppsInput[] = JSON.parse(getInput('apps'));
    const remoteTag = getInput('remoteTag');
    const localTag = getInput('localTag');
    const registryUrl = getInput('registryUrl');
    const actionIfMissing = getInput('actionIfMissing');

    await uploadImages({ apps, localTag, remoteTag, registryUrl, actionIfMissing });

  } catch (error) {
    setFailed(error as Error);
  }
}
