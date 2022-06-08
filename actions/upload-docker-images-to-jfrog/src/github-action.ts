import { setFailed, getInput } from '@actions/core';
import { uploadImages } from './lib';

export async function run(): Promise<void> {
  try {
    const apps: string[] = JSON.parse(getInput('apps'));
    const remoteTag = getInput('remote-tag');
    const localTag = getInput('local-tag');
    const registryUrl = getInput('registry-url');
    const actionIfMissing = getInput('action-if-missing');

    await uploadImages({ apps, localTag, remoteTag, registryUrl, actionIfMissing });

  } catch (error) {
    setFailed(error as Error);
  }
}
