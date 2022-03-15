import * as actionsCore from '@actions/core';
import * as createCoverageArtifact from '@src/lib/create-coverage-artifact';
import { RushPackage } from '@src/types';
import { run } from '../github-action';

jest.mock('@actions/core');
jest.mock('@src/lib/create-coverage-artifact');

describe('github action', () => {
  const rushPackages: RushPackage[] = [
    {
      packageName: 'packageName',
      projectFolder: 'projectFolder',
    },
  ];

  const setFailedSpy = jest.spyOn(actionsCore, 'setFailed');
  const getInputSpy = jest.spyOn(actionsCore, 'getInput');
  const createCoverageArtifactSpy = jest.spyOn(createCoverageArtifact, 'createCoverageArtifact');

  beforeEach(() => {
    getInputSpy.mockReturnValue(JSON.stringify(rushPackages));
  });

  it('should run createCoverageArtifactSpy', () => {
    run();

    expect(getInputSpy).toHaveBeenCalledTimes(1);
    expect(getInputSpy).toHaveBeenCalledWith('rushProjects');

    expect(createCoverageArtifactSpy).toHaveBeenCalledTimes(1);
    expect(createCoverageArtifactSpy).toHaveBeenCalledWith(rushPackages);

    expect(setFailedSpy).toHaveBeenCalledTimes(0);
  });

  it('should set failure when error occurs', () => {
    const error = new Error('error');

    getInputSpy.mockImplementation(() => {
      throw error;
    });

    run();

    expect(setFailedSpy).toHaveBeenCalledTimes(1);
    expect(setFailedSpy).toHaveBeenCalledWith(error.message);
  });
});
