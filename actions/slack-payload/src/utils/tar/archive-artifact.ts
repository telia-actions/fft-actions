import { exec } from '@actions/exec';

export const unzipArtifact = async (tarfile: string): Promise<void> => {
  await exec('ls', ['-la']);
  const exitCode = await exec('tar', ['xvf', tarfile]);
  if (exitCode !== 0) {
    throw new Error(`tar failed with exit code ${exitCode} when unzipping ${tarfile}`);
  }
};
