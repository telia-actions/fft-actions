import { getInput, setFailed } from '@actions/core';
import { uploadPackageToAws } from '@src/lib/upload-package-to-aws';
import { ProjectInput } from '@src/types';

export async function run(): Promise<void> {
  try {
    const rushProjectInput = getInput('rush-projects');
    const s3Address = getInput('s3-address');

    const rushProjects: ProjectInput[] = JSON.parse(rushProjectInput);

    for (const rushProject of rushProjects) {
      await uploadPackageToAws({ rushProject, s3Address });
    }
  } catch (error) {
    setFailed(error as Error);
  }
}
