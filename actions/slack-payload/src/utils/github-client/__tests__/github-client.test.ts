import * as github from '@actions/github';
import { getArtifact, getAttachmentsData, getJobsData, getPullRequestData } from '../github-client';

const mockedResponse = 'response';
const mockedToken = 'token';
const mockedOwner = 'owner';
const mockedRepo = 'repo';
const mockedNumber = 1;

const getPullRequestMock = jest.fn().mockResolvedValue({ data: mockedResponse });
const listWorkflowRunArtifactsMock = jest.fn().mockResolvedValue({ data: mockedResponse });
const listWorkflowRunMock = jest.fn().mockResolvedValue({ data: mockedResponse });
const downloadArtifactMock = jest.fn().mockResolvedValue({ data: mockedResponse });

jest.mock('@actions/github', () => {
  return {
    getOctokit: jest.fn().mockReturnValue({
      rest: {
        pulls: {
          get: ({ ...params }) => getPullRequestMock({ ...params }),
        },
        actions: {
          listWorkflowRunArtifacts: ({ ...params }) => listWorkflowRunArtifactsMock({ ...params }),
          listJobsForWorkflowRun: ({ ...params }) => listWorkflowRunMock({ ...params }),
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
  describe('getPullRequestData method', () => {
    it('should return pull request data', async () => {
      const getOctokitSpy = jest.spyOn(github, 'getOctokit');
      const data = await getPullRequestData(mockedToken, mockedNumber);

      expect(data).toBe(mockedResponse);
      expect(getOctokitSpy).toBeCalledTimes(1);
      expect(getOctokitSpy).toHaveBeenCalledWith(mockedToken);
      expect(getPullRequestMock).toBeCalledTimes(1);
      expect(getPullRequestMock).toHaveBeenCalledWith({
        owner: mockedOwner,
        pull_number: mockedNumber,
        repo: mockedRepo,
      });
    });
  });
  describe('getAttachmentsData method', () => {
    it('should return attachments data', async () => {
      const getOctokitSpy = jest.spyOn(github, 'getOctokit');
      const data = await getAttachmentsData(mockedToken, mockedNumber);

      expect(data).toBe(mockedResponse);
      expect(getOctokitSpy).toBeCalledTimes(1);
      expect(getOctokitSpy).toHaveBeenCalledWith(mockedToken);
      expect(listWorkflowRunArtifactsMock).toBeCalledTimes(1);
      expect(listWorkflowRunArtifactsMock).toHaveBeenCalledWith({
        owner: mockedOwner,
        run_id: mockedNumber,
        repo: mockedRepo,
      });
    });
  });
  describe('getJobsData method', () => {
    it('should return jobs data', async () => {
      const getOctokitSpy = jest.spyOn(github, 'getOctokit');
      const data = await getJobsData(mockedToken, mockedNumber);

      expect(data).toBe(mockedResponse);
      expect(getOctokitSpy).toBeCalledTimes(1);
      expect(getOctokitSpy).toHaveBeenCalledWith(mockedToken);
      expect(listWorkflowRunMock).toBeCalledTimes(1);
      expect(listWorkflowRunMock).toHaveBeenCalledWith({
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
      expect(getOctokitSpy).toBeCalledTimes(1);
      expect(getOctokitSpy).toHaveBeenCalledWith(mockedToken);
      expect(downloadArtifactMock).toBeCalledTimes(1);
      expect(downloadArtifactMock).toHaveBeenCalledWith({
        archive_format: 'zip',
        artifact_id: mockedNumber,
        owner: mockedOwner,
        repo: mockedRepo,
      });
    });
  });
});
