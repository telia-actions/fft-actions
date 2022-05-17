import '@actions/github';
import * as githubClient from '@src/utils/github-client';
import { getWorkflowContext } from '../workflow-context';

const mockedToken = 'token';

jest.mock('@actions/github', () => {
  return {
    context: {
      payload: {
        workflow_run: {
          id: 1,
          check_suite_id: 1,
          conclusion: 'success',
          name: 'name',
          html_url: 'url',
          head_sha: 'sha',
          pull_requests: [],
        },
        repository: {
          name: 'name',
          html_url: 'url',
        },
      },
    },
  };
});

jest.mock('@src/utils/github-client');
jest.spyOn(githubClient, 'getAttachmentsData').mockResolvedValue({
  total_count: 1,
  artifacts: [
    {
      id: 1,
      name: 'workflowInfo',
    } as any,
  ],
});
jest.spyOn(githubClient, 'getJobsData').mockResolvedValue({
  total_count: 1,
  jobs: [],
});

describe('getWorkflowContext method', () => {
  it('should return base context', async () => {
    const payload = await getWorkflowContext(mockedToken);

    expect(payload).toStrictEqual({
      attachmentsIds: {
        buildLogsArtifactId: 0,
        workflowInfoArtifactId: 1,
        testLogsArtifactId: 0,
      },
      checkSuiteId: 1,
      conclusion: 'success',
      jobsOutcome: {
        failedJobSteps: [],
        failureDeployCount: 0,
        successDeployCount: 0,
      },
      name: 'name',
      pullRequest: undefined,
      repository: {
        name: 'name',
        url: 'url',
      },
      runId: 1,
      sha: 'sha',
      url: 'url',
    });
  });
});
