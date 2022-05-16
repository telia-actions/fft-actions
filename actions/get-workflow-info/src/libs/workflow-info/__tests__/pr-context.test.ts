import '@actions/github';
import '@src/utils/exec-client';
import '@src/utils/file-client';
import * as githubClient from '@src/utils/github-client';
import { getWorkflowContext } from '../workflow-info';

const mockedToken = 'token';
const mockedBuffer = new ArrayBuffer(8);
const mockedPrNumber = 1;
const mockedTitle = 'title';
const mockedUrl = 'url';

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
          pull_requests: [{ number: 1 }],
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
  total_count: 1,
  jobs: [],
});
jest.spyOn(githubClient, 'getPullRequestData').mockResolvedValue({
  html_url: mockedUrl,
  number: mockedPrNumber,
  title: mockedTitle,
} as any);

describe('getWorkflowContext method', () => {
  it('should return context pull request context', async () => {
    const payload = await getWorkflowContext(mockedToken);
    expect(payload.pullRequest?.number).toBe(mockedPrNumber);
    expect(payload.pullRequest?.title).toBe(mockedTitle);
    expect(payload.pullRequest?.url).toBe(mockedUrl);
  });
});
