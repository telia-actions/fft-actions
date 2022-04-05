import { exec } from '@actions/exec';

export const unzipArtifact = async (zipFile: string): Promise<void> => {
  await exec('ls', ['-la']);
  const exitCode = await exec('unzip', [zipFile]);
  if (exitCode !== 0) {
    throw new Error(`tar failed with exit code ${exitCode} when unzipping ${zipFile}`);
  }
};
