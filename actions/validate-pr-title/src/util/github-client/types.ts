import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export type CreateIssueCommentOptions = {
  token: string;
  owner: string;
  repository: string;
  issueNumber: number;
  body: string;
};

export type CreateIssueCommentResult =
  RestEndpointMethodTypes['issues']['createComment']['response']['data'];

export type GetIssueOptions = {
  token: string;
  owner: string;
  repository: string;
  issueNumber: number;
};

export type GetIssueResult = RestEndpointMethodTypes['issues']['get']['response']['data'];
