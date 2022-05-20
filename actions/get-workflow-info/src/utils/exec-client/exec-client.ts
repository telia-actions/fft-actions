import { exec } from '@actions/exec';

export const unzipArtifact = async (zipFile: string): Promise<void> => {
  const exitCode = await exec('unzip', [zipFile]);
  if (exitCode !== 0) {
    throw new Error(`uzip failed with exit code ${exitCode} when unzipping ${zipFile}`);
  }
};
