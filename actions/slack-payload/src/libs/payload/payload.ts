import { Colors, GithubStatus, SlackIcons } from '@src/enums';
import type {
  AttachmentsData,
  JobsData,
  PullRequestData,
  WorkflowData,
} from '@src/utils/github-client/types';
import {
  getLogsPayload,
  getPackagesPayload,
  getPullRequestPayload,
  getTitlePayload,
} from './utils';

export const createPayload = (
  deployEnvironment: string | undefined,
  workflowData: WorkflowData,
  jobsData: JobsData,
  attachmentsData: AttachmentsData,
  pullRequestData?: PullRequestData
): string => {
  const workflowIcon =
    workflowData.conclusion === GithubStatus.SUCCESS ? SlackIcons.SUCCESS : SlackIcons.FAILURE;
  const environment = workflowData.pullNumber
    ? `preview-${workflowData.pullNumber}`
    : deployEnvironment;
  const blocks = [];
  const attachments = [];
  const titleBlock = getTitlePayload(
    workflowIcon,
    workflowData.repository.url,
    workflowData.repository.name,
    workflowData.url,
    workflowData.name
  );
  const pullRequestBlock = pullRequestData
    ? getPullRequestPayload(
        pullRequestData.url,
        pullRequestData.number,
        pullRequestData.title,
        workflowData.sha
      )
    : {};
  const successDeploymentAttachments = getPackagesPayload(
    Colors.SUCCESS,
    GithubStatus.SUCCESS,
    jobsData.successDeployCount,
    environment
  );
  const failureDeploymentAttachments = getPackagesPayload(
    Colors.FAILURE,
    GithubStatus.FAILURE,
    jobsData.failureDeployCount,
    environment
  );
  const logsAttachments =
    workflowData.conclusion === GithubStatus.FAILURE ? getLogsPayload(attachmentsData) : {};
  blocks.push(titleBlock);
  blocks.push(pullRequestBlock);
  attachments.push(successDeploymentAttachments);
  attachments.push(failureDeploymentAttachments);
  attachments.push(logsAttachments);
  const payload = {
    blocks,
    attachments,
  };
  return JSON.stringify(payload);
};
