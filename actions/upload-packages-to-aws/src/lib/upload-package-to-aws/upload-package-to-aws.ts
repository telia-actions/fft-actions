import path from 'path';
import { exec } from '@actions/exec';
import { copyFile } from '@src/util/fs';
import { filesToPack } from '@src/util/npm';
import type { ProjectInput } from '@src/types';

export interface UploadPackageToAwsInputs {
  rushProject: ProjectInput;
  s3Address: string;
}

export const TEMP_FOLDER = 'temp';

export async function uploadPackageToAws({
  rushProject,
  s3Address,
}: UploadPackageToAwsInputs): Promise<void> {
  const files = await filesToPack(rushProject.path);

  files.forEach((file) => {
    const sourceFile = path.resolve(rushProject.path, file);
    const targetFile = path.resolve(rushProject.path, TEMP_FOLDER, file);

    copyFile(sourceFile, targetFile);
  });

  const s3TargetPath = 's3://' + path.join(s3Address, rushProject.name, '*');

  await exec('aws', ['s3', 'sync', TEMP_FOLDER, s3TargetPath, '--no-progress'], {
    cwd: rushProject.path,
  });

  await exec('rm', ['-rf', TEMP_FOLDER], {
    cwd: rushProject.path,
  });
}
