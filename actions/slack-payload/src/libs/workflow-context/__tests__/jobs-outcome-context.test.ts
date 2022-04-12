import '@actions/github';
import '@src/utils/file-client';
import '@src/utils/exec-client';
import * as githubClient from '@src/utils/github-client';
import { getWorkflowContext } from '../workflow-context';

const mockedToken = 'token';
const mockedBuffer = new ArrayBuffer(8);
const mockedJobStep = 'build';

jest.mock('@actions/github', () => {
  return {
    context: {
      payload: {
        workflow_run: {
          id: 1,
          check_suite_id: 1,
          conclusion: 'failure',
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
jest.mock('@src/utils/file-client');
jest.mock('@src/utils/exec-client');

jest.spyOn(githubClient, 'getArtifact').mockResolvedValue(mockedBuffer);
jest.spyOn(githubClient, 'getAttachmentsData').mockResolvedValue({
  total_count: 1,
  artifacts: [],
});

jest.spyOn(githubClient, 'getJobsData').mockResolvedValue({
  total_count: 3,
  jobs: [
    {
      name: 'deploy / mocked package',
      conclusion: 'failure',
    },
    {
      name: 'deploy / mocked package',
      conclusion: 'success',
    },
    {
      name: 'name',
      conclusion: 'failure',
      steps: [
        {
          conclusion: 'failure',
          name: mockedJobStep,
        },
      ],
    },
  ] as any[],
});

describe('getWorkflowContext method', () => {
  it('should include jobs outcome context', async () => {
    const payload = await getWorkflowContext(mockedToken);

    expect(payload.jobsOutcome.failedJobSteps).toContain(mockedJobStep);
    expect(payload.jobsOutcome.successDeployCount).toBe(1);
    expect(payload.jobsOutcome.failureDeployCount).toBe(1);
  });
});
