import fs from 'fs';

export const readFile = (pathToFile: string): string => {
  return fs.readFileSync(pathToFile, { encoding: 'utf8' });
};

export const isFileExists = (pathToFile: string): boolean => {
  return !fs.existsSync(pathToFile);
};
