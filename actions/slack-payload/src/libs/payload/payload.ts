import { Colors, GithubStatus, SlackIcons } from '@src/enums';
import type { WorkflowData } from '@src/utils/github-client/types';
import {
  getFailureStep,
  getLogsPayload,
  getPackagesPayload,
  getPullRequestPayload,
  getTitlePayload,
} from '@src/utils/slack-message';

export const createPayload = (workflowData: WorkflowData): string => {
  const blocks = [];
  const attachments = [];

  blocks.push(
    getTitlePayload(
      workflowData.conclusion === GithubStatus.SUCCESS ? SlackIcons.SUCCESS : SlackIcons.FAILURE,
      workflowData.repository.url,
      workflowData.repository.name,
      workflowData.url,
      workflowData.name,
      workflowData.environment
    )
  );
  if (
    workflowData.pullRequest &&
    workflowData.pullRequest.title &&
    workflowData.pullRequest.number &&
    workflowData.pullRequest.url
  ) {
    blocks.push(
      getPullRequestPayload(
        workflowData.sha,
        workflowData.pullRequest.url,
        workflowData.pullRequest.title,
        workflowData.pullRequest.number
      )
    );
  }
  if (workflowData.jobsOutcome.successDeployCount !== 0) {
    attachments.push(
      getPackagesPayload(
        Colors.SUCCESS,
        GithubStatus.SUCCESS,
        workflowData.jobsOutcome.successDeployCount
      )
    );
  }
  if (workflowData.jobsOutcome.failureDeployCount !== 0) {
    attachments.push(
      getPackagesPayload(
        Colors.FAILURE,
        GithubStatus.FAILURE,
        workflowData.jobsOutcome.failureDeployCount
      )
    );
  }
  if (workflowData.conclusion === GithubStatus.FAILURE) {
    attachments.push(getFailureStep(workflowData.jobsOutcome.failedJobSteps));
    attachments.push(
      getLogsPayload(
        workflowData.repository.url,
        workflowData.checkSuiteId,
        workflowData.attachmentsIds.buildLogsArtifactId,
        workflowData.attachmentsIds.testLogsArtifactId
      )
    );
  }

  const payload = {
    blocks,
    attachments,
  };
  return JSON.stringify(payload);
};
