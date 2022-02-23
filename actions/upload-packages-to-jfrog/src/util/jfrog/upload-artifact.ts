import { exec } from '@actions/exec';
import { UploadInputs } from '@src/types';

export async function uploadArtifact({
  repositoryUrl,
  apiKey,
  tarfile,
  destination,
}: UploadInputs) {
  const exitCode = await exec('curl', [
    '-H',
    `X-JFrog-Art-Api:${apiKey}`,
    '-T',
    tarfile,
    `${repositoryUrl}/${destination}`,
  ]);
  if (exitCode !== 0) {
    throw new Error(`Artifactory upload failed with exit code ${exitCode} for artifact ${tarfile}`);
  }
}
