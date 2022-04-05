import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export type WorkflowData = {
  name: string;
  conclusion: string | null;
  url: string;
  runId: number;
  sha: string;
  pullNumber: number | undefined;
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

export type JobsData = {
  successDeployCount: number;
  failureDeployCount: number;
  failedJobs: string[];
};

export type AttachmentsData = {
  buildLogsUrl: string;
  testLogsUrl: string;
  environmentArtifactId: number;
};

export type ListJobsForWorkflowRun =
  RestEndpointMethodTypes['actions']['listJobsForWorkflowRun']['response']['data'];
