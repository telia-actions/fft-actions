import * as actionsCore from '@actions/core';
import * as util from '@src/util/json-client';
import config from '../__mocks__/config';
import { run } from '../github-action';
import { when } from 'jest-when';

jest.mock('@actions/core');
jest.mock('@src/util/json-client');

describe('github action', () => {
  const configFilePath = 'configFilePath';
  const staticAppName = '';

  const setOutputSpy = jest.spyOn(actionsCore, 'setOutput');
  const setFailedSpy = jest.spyOn(actionsCore, 'setFailed');
  const getInputSpy = jest.spyOn(actionsCore, 'getInput');
  const readJsonWithCommentsSpy = jest.spyOn(util, 'readJsonWithComments');

  beforeEach(() => {
    when(getInputSpy)
      .calledWith('configFilePath')
      .mockReturnValue(configFilePath)
      .calledWith('staticAppName')
      .mockReturnValue(staticAppName);

    readJsonWithCommentsSpy.mockReturnValue(config);
  });

  it('should set full config output', () => {
    run();

    expect(readJsonWithCommentsSpy).toHaveBeenCalledTimes(1);
    expect(readJsonWithCommentsSpy).toHaveBeenCalledWith(configFilePath);

    expect(getInputSpy).toHaveBeenCalledTimes(2);
    expect(getInputSpy).toHaveBeenCalledWith('configFilePath');
    expect(getInputSpy).toHaveBeenCalledWith('staticAppName');

    expect(setOutputSpy).toHaveBeenCalledTimes(1);
    expect(setOutputSpy).toHaveBeenCalledWith('config', config);

    expect(setFailedSpy).toHaveBeenCalledTimes(0);
  });

  it('should set static app config output', () => {
    const appName = 'app3';

    when(getInputSpy).calledWith('staticAppName').mockReturnValue(appName);

    run();

    expect(setOutputSpy).toHaveBeenCalledTimes(2);
    expect(setOutputSpy).toHaveBeenCalledWith('config', config);
    expect(setOutputSpy).toHaveBeenCalledWith('staticApp', {
      name: 'app3',
      health_check: '/app3',
      port: 3002,
      routes: [],
    });
  });

  it('should set failure when error occurs', () => {
    const error = new Error('error');

    getInputSpy.mockImplementation(() => {
      throw error;
    });

    run();

    expect(setOutputSpy).toHaveBeenCalledTimes(0);

    expect(setFailedSpy).toHaveBeenCalledTimes(1);
    expect(setFailedSpy).toHaveBeenCalledWith(error.message);
  });
});
