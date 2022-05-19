import '@actions/github';
import '@src/utils/file-client';
import '@src/utils/exec-client';
import * as fileClient from '@src/utils/file-client';
import * as githubClient from '@src/utils/github-client';
import { getWorkflowInfo } from '../workflow-info';

const mockedToken = 'token';
const mockedWorkflowInfo = { environment: 'dev-test', author_email: 'noreply@telia.se' };
const mockedWorkflowInfoOnFailure = { environment: null, author_email: null };
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

describe('getWorkflowInfo method', () => {
  it('should return workflow info', async () => {
    jest.spyOn(githubClient, 'getAttachmentsData').mockResolvedValue({
      total_count: 1,
      artifacts: [
        {
          id: 1,
          name: 'workflowInfo',
        } as any,
      ],
    });
    const workflowInfo = await getWorkflowInfo(mockedToken);

    expect(workflowInfo).toStrictEqual({
      environment: mockedWorkflowInfo.environment,
      author_email: mockedWorkflowInfo.author_email,
    });
  });

  it('should list author and environment as "Unknown" when artifact contents are not valid JSON', async () => {
    jest.spyOn(fileClient, 'readFile').mockReturnValue('Bad JSON');
    const workflowInfo = await getWorkflowInfo(mockedToken);

    expect(workflowInfo).toEqual(
      expect.objectContaining({
        environment: mockedWorkflowInfoOnFailure.environment,
        author_email: mockedWorkflowInfoOnFailure.author_email,
      })
    );
  });


  it('should list author and environment as "Unknown" when workflowInfo attachment is not found', async () => {
    jest.spyOn(githubClient, 'getAttachmentsData').mockResolvedValue({
      total_count: 1,
      artifacts: [
        {
          id: 1,
          name: 'no_workflowInfo',
        } as any,
      ],
    });
    const workflowInfo = await getWorkflowInfo(mockedToken);

    expect(workflowInfo).toStrictEqual({
      environment: mockedWorkflowInfoOnFailure.environment,
      author_email: mockedWorkflowInfoOnFailure.author_email,
    });
  });
});

