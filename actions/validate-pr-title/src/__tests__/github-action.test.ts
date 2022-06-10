import * as actionsCore from '@actions/core';
import * as validatePrTitle from '@src/lib/validate-pr-title';
import { run } from '../github-action';
import { when } from 'jest-when';

jest.mock('@actions/core');
jest.mock('@src/lib/validate-pr-title');

describe('github action', () => {
  const token = 'token';
  const owner = 'owner';
  const repository = 'repository';
  const pullRequestNumber = 'pullRequestNumber';

  const setFailedSpy = jest.spyOn(actionsCore, 'setFailed');
  const getInputSpy = jest.spyOn(actionsCore, 'getInput');
  const validatePrTitleSpy = jest.spyOn(validatePrTitle, 'validatePrTitle');

  beforeEach(() => {
    when(getInputSpy)
      .calledWith('token')
      .mockReturnValue(token)
      .calledWith('owner')
      .mockReturnValue(owner)
      .calledWith('repository')
      .mockReturnValue(repository)
      .calledWith('pull-request-number')
      .mockReturnValue(pullRequestNumber);
  });

  it('should run validatePrTitle', () => {
    run();

    expect(getInputSpy).toHaveBeenCalledTimes(4);
    expect(getInputSpy).toHaveBeenCalledWith('token');
    expect(getInputSpy).toHaveBeenCalledWith('owner');
    expect(getInputSpy).toHaveBeenCalledWith('repository');
    expect(getInputSpy).toHaveBeenCalledWith('pull-request-number');

    expect(validatePrTitleSpy).toHaveBeenCalledTimes(1);
    expect(validatePrTitleSpy).toHaveBeenCalledWith({
      token,
      owner,
      repository,
      pullRequestNumber: Number(pullRequestNumber),
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
