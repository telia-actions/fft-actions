import fs from 'fs';

export const readFile = (pathToFile: string): string => {
  return fs.readFileSync(pathToFile, { encoding: 'utf8' });
};

export const writeFile = (fileName: string, content: Buffer): void => {
  fs.writeFileSync(fileName, content);
};
