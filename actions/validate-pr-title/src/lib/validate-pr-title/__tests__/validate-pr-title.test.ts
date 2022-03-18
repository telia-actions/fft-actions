import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { validatePrTitle } from '..';
import * as githubClient from '@src/util/github-client';
import { mockPartial } from '@src/util/mocks';
import * as validators from '@src/util/validators';
import { ValidationResult } from '@srcutil/validators/types';
import { prTitleValidator } from '@src/util/validators';

jest.mock('@src/util/github-client');
jest.mock('@src/util/validators');

describe('validatePrTitle', () => {
  const token = 'token';
  const owner = 'owner';
  const repository = 'repository';
  const pullRequestNumber = 5;

  const issue = mockPartial<RestEndpointMethodTypes['issues']['get']['response']['data']>({
    id: 234,
    title: 'title',
  });

  const createCommentSpy = jest.spyOn(githubClient, 'createComment');
  const getIssueSpy = jest.spyOn(githubClient, 'getIssue');
  const prTitleValidatorSpy = jest.spyOn(validators, 'prTitleValidator');

  beforeEach(() => {
    getIssueSpy.mockResolvedValue(issue);
  });

  it('should validate pr title', async () => {
    const validationResult: ValidationResult = {
      isValid: true,
    };

    prTitleValidatorSpy.mockReturnValue(validationResult);

    await validatePrTitle({ token, owner, repository, pullRequestNumber });

    expect(getIssueSpy).toHaveBeenCalledTimes(1);
    expect(getIssueSpy).toHaveBeenCalledWith({
      issueNumber: pullRequestNumber,
      token,
      owner,
      repository,
    });

    expect(prTitleValidatorSpy).toHaveBeenCalledTimes(1);
    expect(prTitleValidatorSpy).toHaveBeenCalledWith(issue.title);

    expect(createCommentSpy).toHaveBeenCalledTimes(0);
  });

  it('should create comment when validation fails', async () => {
    const validationResult: ValidationResult = {
      isValid: false,
      error: 'error',
    };

    prTitleValidatorSpy.mockReturnValue(validationResult);

    await expect(validatePrTitle({ token, owner, repository, pullRequestNumber })).rejects.toEqual(
      new Error(validationResult.error)
    );

    expect(getIssueSpy).toHaveBeenCalledTimes(1);
    expect(getIssueSpy).toHaveBeenCalledWith({
      issueNumber: pullRequestNumber,
      token,
      owner,
      repository,
    });

    expect(prTitleValidatorSpy).toHaveBeenCalledTimes(1);
    expect(prTitleValidatorSpy).toHaveBeenCalledWith(issue.title);

    expect(createCommentSpy).toHaveBeenCalledTimes(1);
    expect(createCommentSpy).toHaveBeenCalledWith({
      issueNumber: pullRequestNumber,
      body: validationResult.error,
      token,
      owner,
      repository,
    });
  });
});
