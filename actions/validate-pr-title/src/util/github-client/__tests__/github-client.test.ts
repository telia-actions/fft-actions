import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import { RequestInterface } from '@octokit/types';
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { createComment, getIssue } from '..';
import { mockPartial } from '@src/util/mocks';

jest.mock('@actions/github');

const octokitFn = (): jest.Mock & {
  defaults?: RequestInterface['defaults'];
} => jest.fn();

describe('githubClient', () => {
  const token = 'token';
  const owner = 'owner';
  const repository = 'repository';
  const body = 'body';
  const issueNumber = 5;

  const commentResponse = mockPartial<
    RestEndpointMethodTypes['issues']['createComment']['response']
  >({
    data: {
      id: 123,
    },
  });

  const issueResponse = mockPartial<RestEndpointMethodTypes['issues']['get']['response']>({
    data: {
      id: 234,
    },
  });

  const getOctokitSpy = jest.spyOn(github, 'getOctokit');

  const createCommentFn = octokitFn();
  const getFn = octokitFn();

  const octokit = mockPartial<InstanceType<typeof GitHub>>({
    rest: {
      issues: {
        createComment: createCommentFn,
        get: getFn,
      },
    },
  });

  beforeEach(() => {
    getOctokitSpy.mockReturnValue(octokit);
  });

  describe('createComment', () => {
    it('should create comment', async () => {
      createCommentFn.mockResolvedValue(commentResponse);

      const result = await createComment({ token, owner, repository, body, issueNumber });

      expect(getOctokitSpy).toHaveBeenCalledTimes(1);
      expect(getOctokitSpy).toHaveBeenCalledWith(token);

      expect(createCommentFn).toHaveBeenCalledTimes(1);
      expect(createCommentFn).toHaveBeenCalledWith({
        owner,
        repo: repository,
        issue_number: issueNumber,
        body,
      });

      expect(result).toBe(commentResponse.data);
    });
  });

  describe('getIssue', () => {
    it('should get issue', async () => {
      getFn.mockResolvedValue(issueResponse);

      const result = await getIssue({ token, owner, repository, issueNumber });

      expect(getOctokitSpy).toHaveBeenCalledTimes(1);
      expect(getOctokitSpy).toHaveBeenCalledWith(token);

      expect(getFn).toHaveBeenCalledTimes(1);
      expect(getFn).toHaveBeenCalledWith({
        owner,
        repo: repository,
        issue_number: issueNumber,
      });

      expect(result).toBe(issueResponse.data);
    });
  });
});
