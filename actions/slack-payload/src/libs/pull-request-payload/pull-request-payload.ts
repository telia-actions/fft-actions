import { GithubStatus, SlackIcons } from '@src/enums';
import type { PullRequestData, WorkflowData } from '@src/utils/github/types';

export const createPullRequestPayload = (
  pullRequestData: PullRequestData,
  workflowData: WorkflowData,
  deployedPackagesCount: number
): string => {
  // eslint-disable-next-line no-console
  console.log(workflowData);
  const workflowIcon =
    workflowData.conclusion === GithubStatus.SUCCESS ? SlackIcons.SUCCESS : SlackIcons.FAILURE;
  const blocks = [];
  const attachments = [];
  const titleBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${workflowIcon} *<${workflowData.repository.url}|${workflowData.repository.name}>* - ${workflowData.name}`,
    },
  };
  const infoBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${SlackIcons.PULL_REQUEST} *<${pullRequestData.url}|#${pullRequestData.number} ${pullRequestData.title}>* (commit id \`${workflowData.sha}\`)`,
    },
  };
  const packagesAttachments = {
    color: '#808080',
    fallback: `${deployedPackagesCount} packages were deployed to a preview environment (preview-${pullRequestData.number})`,
    text: `${deployedPackagesCount} packages were deployed to a preview environment (preview-${pullRequestData.number})`,
  };
  blocks.push(titleBlock);
  blocks.push(infoBlock);
  attachments.push(packagesAttachments);
  const payload = {
    blocks,
    attachments,
  };
  return JSON.stringify(payload);
};
