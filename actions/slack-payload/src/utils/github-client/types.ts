import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export type WorkflowData = {
  environment: string;
  checkSuiteId: number;
  name: string;
  conclusion: string | null;
  url: string;
  runId: number;
  sha: string;
  repository: {
    name: string;
    url: string;
  };
  attachmentsIds: AttachmentsData;
  jobsOutcome: JobsData;
  pullRequest: PullRequestData | undefined;
};

export type PullRequestData = {
  number?: number;
  title?: string;
  url?: string;
};

export type JobsData = {
  successDeployCount: number;
  failureDeployCount: number;
  failedJobSteps: string[];
};

export type AttachmentsData = {
  buildLogsArtifactId: number;
  testLogsArtifactId: number;
  environmentArtifactId: number;
};

export type ListJobsForWorkflowRun =
  RestEndpointMethodTypes['actions']['listJobsForWorkflowRun']['response']['data'];
