import * as packlist from 'npm-packlist';
import { filesToPack } from '..';

jest.mock('npm-packlist');

describe('packlist', () => {
  describe('filesToPack', () => {
    const files = ['file1', 'file2'];

    const projectFolder = 'projectFolder';

    const packlistSpy = jest.spyOn(packlist, 'default');

    it('should return packed files', async () => {
      packlistSpy.mockResolvedValue(files);

      const result = await filesToPack(projectFolder);

      expect(result).toBe(files);

      expect(packlistSpy).toHaveBeenCalledTimes(1);
      expect(packlistSpy).toHaveBeenCalledWith({ path: projectFolder });
    });
  });
});
