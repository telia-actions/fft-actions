import * as path from 'path';
import * as fs from 'fs';
import { copyFile } from '..';

jest.mock('fs');
jest.mock('path');

describe('fs', () => {
  describe('copyFile', () => {
    const files = ['file1', 'file2'];

    const sourceFile = 'sourceFile';
    const targetFile = 'targetFile';

    const existsSyncSpy = jest.spyOn(fs, 'existsSync');
    const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync');
    const copyFileSyncSpy = jest.spyOn(fs, 'copyFileSync');

    const dirnameSpy = jest.spyOn(path, 'dirname');

    it('should copy file when directory exists', () => {
      const dir = 'dir';
      const exists = true;

      dirnameSpy.mockReturnValue(dir);
      existsSyncSpy.mockReturnValue(exists);

      copyFile(sourceFile, targetFile);

      expect(existsSyncSpy).toHaveBeenCalledTimes(1);
      expect(existsSyncSpy).toHaveBeenCalledWith(dir);

      expect(mkdirSyncSpy).toHaveBeenCalledTimes(0);

      expect(copyFileSyncSpy).toHaveBeenCalledTimes(1);
      expect(copyFileSyncSpy).toHaveBeenCalledWith(sourceFile, targetFile);
    });

    it(`should copy file and create directory when it doesn't exist`, () => {
      const dir = 'dir';
      const exists = false;

      dirnameSpy.mockReturnValue(dir);
      existsSyncSpy.mockReturnValue(exists);

      copyFile(sourceFile, targetFile);

      expect(existsSyncSpy).toHaveBeenCalledTimes(1);
      expect(existsSyncSpy).toHaveBeenCalledWith(dir);

      expect(mkdirSyncSpy).toHaveBeenCalledTimes(1);

      expect(copyFileSyncSpy).toHaveBeenCalledTimes(1);
      expect(copyFileSyncSpy).toHaveBeenCalledWith(sourceFile, targetFile);
    });
  });
});
