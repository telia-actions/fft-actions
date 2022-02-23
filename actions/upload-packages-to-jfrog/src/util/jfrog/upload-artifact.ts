import { exec } from '@actions/exec';
import { UploadInputs } from '@src/types';

export async function uploadArtifact({
  repositoryUrl,
  username,
  password,
  tarfile,
  destination,
}: UploadInputs) {
  const exitCode = await exec('curl', [
    '-u',
    `${username}:${password}`,
    '-T',
    tarfile,
    `${repositoryUrl}/${destination}`,
    '--fail',
  ]);
  if (exitCode !== 0) {
    throw new Error(`Artifactory upload failed with exit code ${exitCode} for artifact ${tarfile}`);
  }
}
