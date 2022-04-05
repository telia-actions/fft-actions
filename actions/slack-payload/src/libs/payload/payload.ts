import { Colors, GithubStatus, SlackIcons } from '@src/enums';
import type { WorkflowData } from '@src/utils/github-client/types';
import {
  getLogsPayload,
  getPackagesPayload,
  getPullRequestPayload,
  getTitlePayload,
} from '@src/utils/slack-message';

export const createPayload = async (workflowData: WorkflowData): Promise<string> => {
  const blocks = [];
  const attachments = [];

  blocks.push(
    getTitlePayload(
      workflowData.conclusion === GithubStatus.SUCCESS ? SlackIcons.SUCCESS : SlackIcons.FAILURE,
      workflowData.repository.url,
      workflowData.repository.name,
      workflowData.url,
      workflowData.name
    )
  );
  if (
    workflowData.pullRequest?.title &&
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
  attachments.push(
    getPackagesPayload(
      Colors.SUCCESS,
      GithubStatus.SUCCESS,
      workflowData.jobsOutcome.successDeployCount,
      workflowData.environment
    )
  );
  attachments.push(
    getPackagesPayload(
      Colors.FAILURE,
      GithubStatus.FAILURE,
      workflowData.jobsOutcome.failureDeployCount,
      workflowData.environment
    )
  );

  if (workflowData.conclusion === GithubStatus.FAILURE) {
    attachments.push(
      getLogsPayload(
        workflowData.url,
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
  console.log(payload);
  return JSON.stringify(payload);
};
