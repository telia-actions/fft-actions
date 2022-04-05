import { Colors, SlackIcons } from '@src/enums';
import { AttachmentsData } from '@src/utils/github-client/types';

export const getPullRequestPayload = (
  url: string,
  number: number,
  title: string,
  sha: string
): any => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${SlackIcons.PULL_REQUEST} *<${url}|#${number} ${title}>* (commit id \`${sha}\`)`,
    },
  };
};

export const getPackagesPayload = (
  color: string,
  status: string,
  count: number,
  environment: string
): any => {
  if (count === 0) return {};
  const upperCaseEnvironment = environment.toUpperCase();
  const message = `${status} deployments - *${count}* to *${upperCaseEnvironment}* environment`;
  return {
    color,
    fallback: message,
    text: message,
  };
};

export const getTitlePayload = (
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

export const getLogsPayload = (attachmentsData: AttachmentsData): any => {
  const message = `${SlackIcons.DOWNLOADS} Download ${
    attachmentsData.buildLogsUrl ? `*<${attachmentsData.buildLogsUrl}|build logs>*` : ''
  } ${attachmentsData.testLogsUrl ? `*<${attachmentsData.testLogsUrl}|test logs>*` : ''}`;
  return {
    color: Colors.FAILURE,
    fallback: message,
    text: message,
  };
};
