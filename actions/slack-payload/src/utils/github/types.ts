import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export type WorkflowData = {
  name: string | null | undefined;
  conclusion: string | null;
  url: string;
  artifactsUrls: string;
  runId: number;
  sha: string;
  pullNumber: number;
  repository: {
    name: string;
    url: string;
  };
};

export type PullRequestData = {
  title: string;
  number: number;
  url: string;
};

export type ListJobsForWorkflowRun =
  RestEndpointMethodTypes['actions']['listJobsForWorkflowRun']['response']['data'];
