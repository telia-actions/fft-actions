import * as exec from '@actions/exec';
import { unzipArtifact } from '../exec-client';

const command = 'unzip';
const mockedFileName = 'file.zip';

describe('exec client', () => {
  describe('unzipArtifact method', () => {
    it('should execute uzip command', () => {
      const execSpy = jest.spyOn(exec, 'exec').mockResolvedValue(0);

      unzipArtifact(mockedFileName);

      expect(execSpy).toHaveBeenCalledTimes(1);
      expect(execSpy).toHaveBeenCalledWith(command, [mockedFileName]);
    });
    it('should throw an error if unzip fails', async () => {
      const errorCode = 1;

      jest.spyOn(exec, 'exec').mockResolvedValue(errorCode);

      const fnCall = unzipArtifact(mockedFileName);

      await expect(fnCall).rejects.toThrowError(
        `uzip failed with exit code ${errorCode} when unzipping ${mockedFileName}`
      );
    });
  });
});
