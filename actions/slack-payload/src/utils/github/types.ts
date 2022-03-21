import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export type WorkflowData = {
  name: string | null | undefined;
  status: string | null;
  runId: number;
};

export type ListJobsForWorkflowRun =
  RestEndpointMethodTypes['actions']['listJobsForWorkflowRun']['response']['data'];
