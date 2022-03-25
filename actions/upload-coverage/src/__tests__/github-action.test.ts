import * as actionsCore from '@actions/core';
import * as writeCoverageToRds from '@src/lib/write-coverage-to-rds';
import { RushPackage } from '@src/types';
import { run } from '../github-action';
import { when } from 'jest-when';

jest.mock('@actions/core');
jest.mock('@src/lib/write-coverage-to-rds');

describe('github action', () => {
  const rushProjects: RushPackage[] = [
    {
      packageName: 'packageName',
      projectFolder: 'projectFolder',
    },
  ];

  const region = 'region';
  const secretArn = 'secretArn';
  const resourceArn = 'resourceArn';
  const database = 'database';
  const table = 'table';

  const setFailedSpy = jest.spyOn(actionsCore, 'setFailed');
  const getInputSpy = jest.spyOn(actionsCore, 'getInput');
  const writeCoverageToRdsSpy = jest.spyOn(writeCoverageToRds, 'writeCoverageToRds');

  beforeEach(() => {
    when(getInputSpy)
      .calledWith('rushProjects')
      .mockReturnValue(JSON.stringify(rushProjects))
      .calledWith('region')
      .mockReturnValue(region)
      .calledWith('secretArn')
      .mockReturnValue(secretArn)
      .calledWith('resourceArn')
      .mockReturnValue(resourceArn)
      .calledWith('database')
      .mockReturnValue(database)
      .calledWith('table')
      .mockReturnValue(table);
  });

  it('should run writeCoverageToRds', () => {
    run();

    expect(getInputSpy).toHaveBeenCalledTimes(6);
    expect(getInputSpy).toHaveBeenCalledWith('region');
    expect(getInputSpy).toHaveBeenCalledWith('secretArn');
    expect(getInputSpy).toHaveBeenCalledWith('resourceArn');
    expect(getInputSpy).toHaveBeenCalledWith('database');
    expect(getInputSpy).toHaveBeenCalledWith('table');
    expect(getInputSpy).toHaveBeenCalledWith('rushProjects');

    expect(writeCoverageToRdsSpy).toHaveBeenCalledTimes(1);
    expect(writeCoverageToRdsSpy).toHaveBeenCalledWith({
      database,
      resourceArn,
      region,
      rushProjects,
      secretArn,
      table,
    });

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
