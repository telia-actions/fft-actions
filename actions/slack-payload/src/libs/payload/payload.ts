import { GithubStatus, SlackIcons } from '@src/enums';
import type { PullRequestData, WorkflowData } from '@src/utils/github-client/types';

export const createPayload = (
  workflowData: WorkflowData,
  deployedPackagesCount: number,
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
  const packagesAttachments = getPackagesPayload(
    deployedPackagesCount,
    workflowData.pullNumber ? `preview-${workflowData.pullNumber}` : 'dev-test'
  );
  const logsAttachments = workflowData.conclusion === GithubStatus.FAILURE ? getLogsPayload() : {};
  blocks.push(titleBlock);
  blocks.push(pullRequestBlock);
  attachments.push(packagesAttachments);
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

const getPackagesPayload = (count: number, environment: string): any => {
  const upperCaseEnvironment = environment.toUpperCase();
  return {
    color: '#28A745',
    fallback: `${count} packages were deployed to *${upperCaseEnvironment}* environment`,
    text: `${count} packages were deployed to *${upperCaseEnvironment}* environment`,
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

const getLogsPayload = (): any => {
  return {
    color: '#CB2431',
    fallback: `${SlackIcons.DOWNLOADS} Download build logs or test logs in`,
    text: `${SlackIcons.DOWNLOADS} Download build logs or test logs in`,
  };
};
