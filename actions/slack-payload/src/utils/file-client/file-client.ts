import fs from 'fs';

export const readFile = (pathToFile: string): string | undefined => {
  if (!fs.existsSync(pathToFile)) return;
  return fs.readFileSync(pathToFile, { encoding: 'utf8' });
};
