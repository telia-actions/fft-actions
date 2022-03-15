import {
  CreateIssueCommentOptions,
  CreateIssueCommentResult,
  GetIssueOptions,
  GetIssueResult,
} from '@src/util/github-client/types';
import { getOctokit } from '@actions/github';

export const createComment = async (
  options: CreateIssueCommentOptions
): Promise<CreateIssueCommentResult> => {
  const { token, owner, repository, body, issueNumber } = options;

  const octokit = getOctokit(token);

  const { data } = await octokit.rest.issues.createComment({
    owner,
    repo: repository,
    issue_number: issueNumber,
    body,
  });

  return data;
};

export const getIssue = async (options: GetIssueOptions): Promise<GetIssueResult> => {
  const { token, owner, repository, issueNumber } = options;

  const octokit = getOctokit(token);

  const { data } = await octokit.rest.issues.get({
    owner,
    repo: repository,
    issue_number: issueNumber,
  });

  return data;
};
