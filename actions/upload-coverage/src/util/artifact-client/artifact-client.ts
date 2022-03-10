import { UploadOptions, UploadResponse, create } from '@actions/artifact';

export const uploadArtifact = async (
  artifactName: string,
  files: string[],
  rootDir: string,
  options?: UploadOptions
): Promise<UploadResponse> => {
  const artifactClient = create();

  return artifactClient.uploadArtifact(artifactName, files, rootDir, options);
};
