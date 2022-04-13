import fs from 'fs';
import { readFile, writeFile } from '../file-client';

jest.mock('fs');

const mockedPathToFile = '/path/to/file';

describe('fs client', () => {
  describe('readFile method', () => {
    it('should read file content asynchronous', () => {
      const fsSpy = jest.spyOn(fs, 'readFileSync');

      readFile(mockedPathToFile);

      expect(fsSpy).toHaveBeenCalledTimes(1);
      expect(fsSpy).toHaveBeenCalledWith(mockedPathToFile, 'utf-8');
    });
    it('should write buffer to file synchronously ', () => {
      const mockedContent = Buffer.from([1, 2, 3]);

      const fsSpy = jest.spyOn(fs, 'writeFileSync');

      writeFile(mockedPathToFile, mockedContent);

      expect(fsSpy).toHaveBeenCalledTimes(1);
      expect(fsSpy).toHaveBeenCalledWith(mockedPathToFile, mockedContent, 'utf-8');
    });
  });
});
