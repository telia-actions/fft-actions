import { exec } from '@actions/exec';
import { ProjectPlan } from '@src/types';

export async function archiveArtifact({
  tarfile,
  projectFolder,
  files,
}: ProjectPlan & { files: string[] }) {
  const exitCode = await exec('tar', ['czf', tarfile, '-C', projectFolder, ...files]);
  if (exitCode !== 0) {
    throw new Error(`tar failed with exit code ${exitCode} when archiving ${projectFolder}`);
  }
}
