import fs from 'fs';
import { writefile } from '../file-client';

jest.mock('fs');

describe('file client', () => {
  describe('writeFile', () => {
    it('should write file', () => {
      const path = 'path';
      const content = 'content';

      const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync');

      writefile(path, content);

      expect(writeFileSyncSpy).toHaveBeenCalledTimes(1);
      expect(writeFileSyncSpy).toHaveBeenCalledWith(path, content);
    });
  });
});
