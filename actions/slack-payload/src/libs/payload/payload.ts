import { Colors, GithubStatus, SlackIcons } from '@src/enums';
import type {
  AttachmentsData,
  JobsData,
  PullRequestData,
  WorkflowData,
} from '@src/utils/github-client/types';

export const createPayload = (
  workflowData: WorkflowData,
  jobsData: JobsData,
  attachmentsData: AttachmentsData,
  pullRequestData?: PullRequestData
): string => {
  const workflowIcon =
    workflowData.conclusion === GithubStatus.SUCCESS ? SlackIcons.SUCCESS : SlackIcons.FAILURE;
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
    ? getpullRequestPayload(
        pullRequestData.url,
        pullRequestData.number,
        pullRequestData.title,
        workflowData.sha
      )
    : {};
  const successDeploymentAttachments = getSuccessPackagesPayload(
    jobsData.successDeployCount,
    workflowData.pullNumber ? `preview-${workflowData.pullNumber}` : 'dev-test'
  );
  const failureDeploymentAttachments = getFailurePackagesPayload(jobsData.failureDeployCount);
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

const getpullRequestPayload = (url: string, number: number, title: string, sha: string): any => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${SlackIcons.PULL_REQUEST} *<${url}|#${number} ${title}>* (commit id \`${sha}\`)`,
    },
  };
};

const getSuccessPackagesPayload = (count: number, environment: string): any => {
  if (count === 0) return {};
  const upperCaseEnvironment = environment.toUpperCase();
  return {
    color: Colors.SUCCESS,
    fallback: `${count} packages were deployed to *${upperCaseEnvironment}* environment`,
    text: `${count} packages were deployed to *${upperCaseEnvironment}* environment`,
  };
};

const getFailurePackagesPayload = (count: number): any => {
  if (count === 0) return {};
  return {
    color: Colors.FAILURE,
    fallback: `${count} packages failed to deploy`,
    text: `${count} packages failed to deploy`,
  };
};

const getTitlePayload = (
  icon: string,
  repositoryUrl: string,
  repositoryName: string,
  workflowUrl: string,
  workflowName: string
): any => {
  return {
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `${icon} *<${repositoryUrl}|${repositoryName}>*`,
      },
      {
        type: 'mrkdwn',
        text: `*<${workflowUrl}|${workflowName}>*`,
      },
    ],
  };
};

const getLogsPayload = (attachmentsData: AttachmentsData): any => {
  const message = `${SlackIcons.DOWNLOADS} Download ${
    attachmentsData.buildLogsUrl ? `*<${attachmentsData.buildLogsUrl}|build logs>*` : ''
  } ${attachmentsData.testLogsUrl ? `*<${attachmentsData.testLogsUrl}|test logs>*` : ''}`;
  return {
    color: Colors.FAILURE,
    fallback: message,
    text: message,
  };
};
