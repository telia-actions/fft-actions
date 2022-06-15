import packlist from 'npm-packlist';

export function filesToPack(path: string): Promise<string[]> {
  return packlist({ path: path });
}
