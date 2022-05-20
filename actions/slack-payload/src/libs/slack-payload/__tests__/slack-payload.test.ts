import { createErrorPayload, createPayload } from '../slack-payload';
import * as slackMessage from '@src/libs/slack-message';
import { Colors, GithubStatus } from '@src/enums';

jest.mock('@src/libs/slack-message');

const mockedWorkflowContext = {
  conclusion: 'any',
  checkSuiteId: 1,
  url: 'url',
  name: 'name',
  runId: 1,
  sha: 'sha',
  repository: {
    url: 'url',
    name: 'name',
  },
  pullRequest: undefined,
  attachmentsIds: {
    buildLogsArtifactId: 0,
    testLogsArtifactId: 0,
    workflowInfoArtifactId: 0,
  },
  jobsOutcome: {
    successDeployCount: 0,
    failureDeployCount: 0,
    failedJobSteps: [],
  },
};

const mockedEnvironemnt = 'dev';

describe('createPayload method', () => {
  it('should return header and information blocks of slack message payload', () => {
    const headerPayloadSpy = jest.spyOn(slackMessage, 'getHeaderBlock');
    const informationPayloadSpy = jest.spyOn(slackMessage, 'getInformationBlock');

    createPayload(mockedWorkflowContext, mockedEnvironemnt);

    expect(headerPayloadSpy).toHaveBeenCalledTimes(1);
    expect(headerPayloadSpy).toHaveBeenCalledWith(mockedWorkflowContext.conclusion);

    expect(informationPayloadSpy).toHaveBeenCalledTimes(1);
    expect(informationPayloadSpy).toHaveBeenCalledWith(
      mockedWorkflowContext.repository.url,
      mockedWorkflowContext.repository.name,
      mockedWorkflowContext.url,
      mockedWorkflowContext.name,
      mockedEnvironemnt
    );
  });
  it('should only contain header and information blocks of slack message payload', () => {
    const pullRequestPayloadSpy = jest.spyOn(slackMessage, 'getPullRequestBlock');
    const packagesPayloadSpy = jest.spyOn(slackMessage, 'getPackagesAttachment');
    const stepFailuresPayloadSpy = jest.spyOn(slackMessage, 'getFailureStepAttachment');
    const logPayloadSpy = jest.spyOn(slackMessage, 'getLogsAttachment');

    createPayload(mockedWorkflowContext, mockedEnvironemnt);

    expect(pullRequestPayloadSpy).toHaveBeenCalledTimes(0);
    expect(packagesPayloadSpy).toHaveBeenCalledTimes(0);
    expect(stepFailuresPayloadSpy).toHaveBeenCalledTimes(0);
    expect(logPayloadSpy).toHaveBeenCalledTimes(0);
  });
  describe('given workflow has pull request context', () => {
    it('should return success workflow payload', () => {
      const pullRequestPayloadSpy = jest.spyOn(slackMessage, 'getPullRequestBlock');
      const mockedPullRequestContext = {
        url: 'url',
        title: 'title',
        number: 1,
      };

      createPayload(
        {
          ...mockedWorkflowContext,
          pullRequest: mockedPullRequestContext,
        },
        mockedEnvironemnt
      );

      expect(pullRequestPayloadSpy).toHaveBeenCalledTimes(1);
      expect(pullRequestPayloadSpy).toHaveBeenCalledWith(
        mockedWorkflowContext.sha,
        mockedPullRequestContext.url,
        mockedPullRequestContext.title,
        mockedPullRequestContext.number
      );
    });
  });
  describe('given workflow has successful deployments', () => {
    it('should return success deployments payload', () => {
      const packagesPayloadSpy = jest.spyOn(slackMessage, 'getPackagesAttachment');

      const mockedJobsOutcome = {
        successDeployCount: 1,
        failureDeployCount: 0,
        failedJobSteps: [],
      };

      createPayload(
        {
          ...mockedWorkflowContext,
          jobsOutcome: mockedJobsOutcome,
        },
        mockedEnvironemnt
      );

      expect(packagesPayloadSpy).toHaveBeenCalledTimes(1);
      expect(packagesPayloadSpy).toHaveBeenCalledWith(
        Colors.SUCCESS,
        GithubStatus.SUCCESS,
        mockedJobsOutcome.successDeployCount
      );
    });
  });
  describe('given workflow has failure deployments', () => {
    it('should return failure deployments payload', () => {
      const packagesPayloadSpy = jest.spyOn(slackMessage, 'getPackagesAttachment');

      const mockedJobsOutcome = {
        successDeployCount: 0,
        failureDeployCount: 1,
        failedJobSteps: [],
      };

      createPayload(
        {
          ...mockedWorkflowContext,
          jobsOutcome: mockedJobsOutcome,
        },
        mockedEnvironemnt
      );

      expect(packagesPayloadSpy).toHaveBeenCalledTimes(1);
      expect(packagesPayloadSpy).toHaveBeenCalledWith(
        Colors.FAILURE,
        GithubStatus.FAILURE,
        mockedJobsOutcome.failureDeployCount
      );
    });
  });
  describe('given workflow has failure steps', () => {
    it('should return failure steps and logs payload', () => {
      const stepFailuresPayloadSpy = jest.spyOn(slackMessage, 'getFailureStepAttachment');
      const logPayloadSpy = jest.spyOn(slackMessage, 'getLogsAttachment');

      const mockedJobsOutcome = {
        successDeployCount: 0,
        failureDeployCount: 0,
        failedJobSteps: ['build'],
      };

      createPayload(
        {
          ...mockedWorkflowContext,
          jobsOutcome: mockedJobsOutcome,
        },
        mockedEnvironemnt
      );

      expect(stepFailuresPayloadSpy).toHaveBeenCalledTimes(1);
      expect(stepFailuresPayloadSpy).toHaveBeenCalledWith(mockedJobsOutcome.failedJobSteps);

      expect(logPayloadSpy).toHaveBeenCalledTimes(1);
      expect(logPayloadSpy).toHaveBeenCalledWith(
        mockedWorkflowContext.repository.url,
        mockedWorkflowContext.checkSuiteId,
        mockedWorkflowContext.attachmentsIds.buildLogsArtifactId,
        mockedWorkflowContext.attachmentsIds.testLogsArtifactId
      );
    });
  });
});

describe('createErrorPayload method', () => {
  it('should return error header block and error attachment', () => {
    const headerPayloadSpy = jest.spyOn(slackMessage, 'getErrorHeaderBlock');
    const errorPayloadSpy = jest.spyOn(slackMessage, 'getErrorAttachment');

    const mockedError = 'error';

    createErrorPayload(mockedError);

    expect(headerPayloadSpy).toHaveBeenCalledTimes(1);

    expect(errorPayloadSpy).toHaveBeenCalledTimes(1);
    expect(errorPayloadSpy).toHaveBeenCalledWith(mockedError);
  });
});
