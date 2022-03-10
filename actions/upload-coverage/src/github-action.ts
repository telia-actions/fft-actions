import { getInput, setFailed } from '@actions/core';
import { RushPackage } from '@src/types';
import { createCoverageArtifact } from '@src/lib/create-coverage-artifact';

export const run = async (): Promise<void> => {
  try {
    const rushProjectsInput = getInput('rushProjects');
    const rushProjects: RushPackage[] = JSON.parse(rushProjectsInput);

    await createCoverageArtifact(rushProjects);
  } catch (error: any) {
    setFailed(error.message);
  }
};
