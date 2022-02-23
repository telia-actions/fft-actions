import packlist from 'npm-packlist';

export function filesToPack(projectFolder: string): Promise<string[]> {
  return packlist({ path: projectFolder });
}
