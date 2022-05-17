import * as github from '@actions/github';
import { getArtifact, getAttachmentsData } from '../github-client';

const mockedResponse = 'response';
const mockedToken = 'token';
const mockedOwner = 'owner';
const mockedRepo = 'repo';
const mockedNumber = 1;

const listWorkflowRunArtifactsMock = jest.fn().mockResolvedValue({ data: mockedResponse });
const downloadArtifactMock = jest.fn().mockResolvedValue({ data: mockedResponse });

jest.mock('@actions/github', () => {
  return {
    getOctokit: jest.fn().mockReturnValue({
      rest: {
        actions: {
          listWorkflowRunArtifacts: ({ ...params }) => listWorkflowRunArtifactsMock({ ...params }),
          downloadArtifact: ({ ...params }) => downloadArtifactMock({ ...params }),
        },
      },
    }),
    context: {
      get repo() {
        return {
          owner: mockedOwner,
          repo: mockedRepo,
        };
      },
    },
  };
});

describe('github-client', () => {
  describe('getAttachmentsData method', () => {
    it('should return attachments data', async () => {
      const getOctokitSpy = jest.spyOn(github, 'getOctokit');
      const data = await getAttachmentsData(mockedToken, mockedNumber);

      expect(data).toBe(mockedResponse);
      expect(getOctokitSpy).toHaveBeenCalledTimes(1);
      expect(getOctokitSpy).toHaveBeenCalledWith(mockedToken);
      expect(listWorkflowRunArtifactsMock).toHaveBeenCalledTimes(1);
      expect(listWorkflowRunArtifactsMock).toHaveBeenCalledWith({
        owner: mockedOwner,
        run_id: mockedNumber,
        repo: mockedRepo,
      });
    });
  });

  describe('getArtifact method', () => {
    it('should return artifact data', async () => {
      const getOctokitSpy = jest.spyOn(github, 'getOctokit');
      const data = await getArtifact(mockedToken, mockedNumber);

      expect(data).toBe(mockedResponse);
      expect(getOctokitSpy).toHaveBeenCalledTimes(1);
      expect(getOctokitSpy).toHaveBeenCalledWith(mockedToken);
      expect(downloadArtifactMock).toHaveBeenCalledTimes(1);
      expect(downloadArtifactMock).toHaveBeenCalledWith({
        archive_format: 'zip',
        artifact_id: mockedNumber,
        owner: mockedOwner,
        repo: mockedRepo,
      });
    });
  });
});
