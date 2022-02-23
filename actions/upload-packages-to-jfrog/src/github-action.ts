import { exec } from '@actions/exec';
import { setFailed } from '@actions/core';
import { archiveArtifact } from './util/tar/archive-artifact';
import { getInputs } from './util/github/get-inputs';
import { planArtifactUpload } from './lib/upload-planner/upload-planner';
import { uploadArtifact } from './util/jfrog/upload-artifact';

export async function run(): Promise<void> {
  try {
    const { apiKey, repositoryUrl, rushProjects, buildIdentifier } = getInputs();
    const tempFolderLocation = 'temp/artifactory-upload';
    const plan = await planArtifactUpload({
      rushProjects,
      buildIdentifier,
      tempFolderLocation,
    });
    await exec('mkdir', ['-p', tempFolderLocation]);
    await Promise.all(
      plan.uploads.map(async (artifact) => {
        await archiveArtifact(artifact);
        return uploadArtifact({
          apiKey,
          repositoryUrl,
          ...artifact,
        });
      })
    );
  } catch (error) {
    setFailed(error as Error);
  }
}
