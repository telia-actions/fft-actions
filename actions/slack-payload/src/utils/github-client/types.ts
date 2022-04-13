import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export type ListJobsForWorkflowRun =
  RestEndpointMethodTypes['actions']['listJobsForWorkflowRun']['response']['data'];

export type PullRequest = RestEndpointMethodTypes['pulls']['get']['response']['data'];

export type ListWorkflowRunArtifacts =
  RestEndpointMethodTypes['actions']['listWorkflowRunArtifacts']['response']['data'];

export type DownloadArtifact =
  RestEndpointMethodTypes['actions']['downloadArtifact']['response']['data'];
