import type { ProjectInput, ProjectPlan } from '@src/types';
import { filesToPack } from '@src/util/npm/packlist';

interface PlanInputs {
  rushProjects: ProjectInput[];
  tempFolderLocation: string;
  buildIdentifier: string;
}

interface Plan {
  uploads: ProjectPlan[];
}

export async function planArtifactUpload({
  rushProjects,
  tempFolderLocation,
  buildIdentifier,
}: PlanInputs): Promise<Plan> {
  const plans = await Promise.all(rushProjects.map(planProject));
  return {
    uploads: plans,
  };

  async function planProject({ packageName, projectFolder }: ProjectInput): Promise<ProjectPlan> {
    const files = await filesToPack(projectFolder);
    return {
      packageName,
      projectFolder,
      tarfile: `${tempFolderLocation}/${packageName.replace('/', '__')}.tar.gz`,
      destination: `${packageName}/${buildIdentifier}.tar.gz`.replace('//', '/'),
      files,
    };
  }
}
