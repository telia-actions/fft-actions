import * as actionsExec from '@actions/exec';
import * as fs from '@src/util/fs';
import * as packlist from '@src/util/npm';
import { TEMP_FOLDER, uploadPackageToAws } from '..';
import { ProjectInput } from '@src/types';
import path from 'path';
import { copyFile } from '@src/util/fs/fs';

jest.mock('@actions/exec');
jest.mock('@src/util/fs');
jest.mock('@src/util/npm');

describe('github action', () => {
  const rushProject: ProjectInput = {
    name: 'name1',
    path: 'path1',
  };

  const files = ['file1', 'file2'];

  const s3Address = 's3Address';

  const execSpy = jest.spyOn(actionsExec, 'exec');
  const copyFileSpy = jest.spyOn(fs, 'copyFile');
  const filesToPackSpy = jest.spyOn(packlist, 'filesToPack');

  it('should run upload packages to AWS', async () => {
    const s3TargetPath = 's3://' + path.join(s3Address, rushProject.name, '*');

    filesToPackSpy.mockResolvedValue(files);

    await uploadPackageToAws({ rushProject, s3Address });

    expect(filesToPackSpy).toHaveBeenCalledTimes(1);
    expect(filesToPackSpy).toHaveBeenCalledWith(rushProject.path);

    expect(copyFileSpy).toHaveBeenCalledTimes(2);
    expect(copyFileSpy).toHaveBeenCalledWith(
      path.resolve(rushProject.path, files[0]),
      path.resolve(rushProject.path, TEMP_FOLDER, files[0])
    );
    expect(copyFileSpy).toHaveBeenCalledWith(
      path.resolve(rushProject.path, files[1]),
      path.resolve(rushProject.path, TEMP_FOLDER, files[1])
    );

    expect(execSpy).toHaveBeenCalledTimes(2);
    expect(execSpy).toHaveBeenCalledWith(
      'aws',
      ['s3', 'sync', TEMP_FOLDER, s3TargetPath, '--no-progress'],
      {
        cwd: rushProject.path,
      }
    );
    expect(execSpy).toHaveBeenCalledWith('rm', ['-rf', TEMP_FOLDER], {
      cwd: rushProject.path,
    });
  });
});
