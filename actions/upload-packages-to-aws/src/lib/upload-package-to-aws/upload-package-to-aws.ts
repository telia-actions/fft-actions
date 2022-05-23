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
  const files = await filesToPack(rushProject.projectFolder);

  files.forEach((file) => {
    const sourceFile = path.resolve(rushProject.projectFolder, file);
    const targetFile = path.resolve(rushProject.projectFolder, TEMP_FOLDER, file);

    copyFile(sourceFile, targetFile);
  });

  const s3TargetPath = 's3://' + path.join(s3Address, rushProject.packageName, '*');

  await exec('aws', ['s3', 'sync', TEMP_FOLDER, s3TargetPath, '--no-progress'], {
    cwd: rushProject.projectFolder,
  });

  await exec('rm', ['-rf', TEMP_FOLDER], {
    cwd: rushProject.projectFolder,
  });
}
