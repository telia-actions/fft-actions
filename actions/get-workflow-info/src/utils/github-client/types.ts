import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export type ListWorkflowRunArtifacts =
  RestEndpointMethodTypes['actions']['listWorkflowRunArtifacts']['response']['data'];

export type DownloadArtifact =
  RestEndpointMethodTypes['actions']['downloadArtifact']['response']['data'];
