import * as actionsCore from '@actions/core';
import * as uploadPackageToAws from '@src/lib/upload-package-to-aws';
import { ProjectInput } from '@src/types';
import { run } from '../github-action';
import { when } from 'jest-when';

jest.mock('@actions/core');
jest.mock('@src/lib/upload-package-to-aws');

describe('github action', () => {
  const rushProjects: ProjectInput[] = [
    {
      name: 'name1',
      path: 'path1',
    },
    {
      name: 'name2',
      path: 'path2',
    },
  ];

  const s3Address = 's3Address';

  const setFailedSpy = jest.spyOn(actionsCore, 'setFailed');
  const getInputSpy = jest.spyOn(actionsCore, 'getInput');
  const uploadPackageToAwsSpy = jest.spyOn(uploadPackageToAws, 'uploadPackageToAws');

  beforeEach(() => {
    when(getInputSpy)
      .calledWith('rush-projects')
      .mockReturnValue(JSON.stringify(rushProjects))
      .calledWith('s3-address')
      .mockReturnValue(s3Address);
  });

  it('should run upload packages to AWS', async () => {
    await run();

    expect(getInputSpy).toHaveBeenCalledTimes(2);
    expect(getInputSpy).toHaveBeenCalledWith('rush-projects');
    expect(getInputSpy).toHaveBeenCalledWith('s3-address');

    expect(uploadPackageToAwsSpy).toHaveBeenCalledTimes(2);
    expect(uploadPackageToAwsSpy).toHaveBeenCalledWith({
      rushProject: rushProjects[0],
      s3Address,
    });
    expect(uploadPackageToAwsSpy).toHaveBeenCalledWith({
      rushProject: rushProjects[1],
      s3Address,
    });

    expect(setFailedSpy).toHaveBeenCalledTimes(0);
  });

  it('should set failure when error occurs', async () => {
    const error = new Error('error');

    getInputSpy.mockImplementation(() => {
      throw error;
    });

    await run();

    expect(setFailedSpy).toHaveBeenCalledTimes(1);
    expect(setFailedSpy).toHaveBeenCalledWith(error);
  });
});
