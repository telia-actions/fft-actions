import '@actions/github';
import '@src/utils/exec-client';
import * as fileClient from '@src/utils/file-client';
import * as githubClient from '@src/utils/github-client';
import { getWorkflowContext } from '../workflow-context';

const mockedToken = 'token';
const mockedWorkflowInfo = { environment: 'dev-test', author_email: 'noreply@telia.se' };
const mockedWorkflowInfoOnFailure = { environment: 'Unknown', author_email: 'Unknown' };
const mockedBuffer = new ArrayBuffer(8);

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
jest.mock('@src/utils/file-client');
jest.mock('@src/utils/exec-client');

jest.spyOn(fileClient, 'readFile').mockReturnValue(JSON.stringify(mockedWorkflowInfo));
jest.spyOn(githubClient, 'getArtifact').mockResolvedValue(mockedBuffer);
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
      environment: mockedWorkflowInfo.environment,
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
      author_email: mockedWorkflowInfo.author_email,
    });
  });

  it('should list author and environment as "Unknown" when artifact contents are not valid JSON', async () => {
    jest.spyOn(fileClient, 'readFile').mockReturnValue('Bad JSON');
    const payload = await getWorkflowContext(mockedToken);

    expect(payload).toEqual(
      expect.objectContaining({
        environment: mockedWorkflowInfoOnFailure.environment,
        author_email: mockedWorkflowInfoOnFailure.author_email,
      })
    );
  });
});
