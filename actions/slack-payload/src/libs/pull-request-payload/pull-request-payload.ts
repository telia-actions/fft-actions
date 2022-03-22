import type { PullRequestEvent } from '@octokit/webhooks-types';
import { GithubStatus, SlackIcons } from '@src/enums';
import { getShortMergeSHA } from '@src/utils/github';
import type { WorkflowData } from '@src/utils/github/types';

export const createPullRequestPayload = (
  context: PullRequestEvent,
  workflow: WorkflowData,
  deployedPackagesCount: number
): string => {
  const { number, title, html_url } = context.pull_request;
  // eslint-disable-next-line no-console
  console.log(workflow);
  const workflowIcon =
    workflow.conclusion === GithubStatus.SUCCESS ? SlackIcons.SUCCESS : SlackIcons.FAILURE;
  const blocks = [];
  const attachments = [];
  const titleBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${workflowIcon} *<${context.repository.html_url}|${context.repository.name}>* - ${workflow.name}`,
    },
  };
  const infoBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${
        SlackIcons.PULL_REQUEST
      } *<${html_url}|#${number} ${title}>* (commit id \`${getShortMergeSHA()}\`)`,
    },
  };
  const packagesAttachments = {
    color: '#808080',
    fallback: `${deployedPackagesCount} packages were deployed to a preview environment (preview-${number})`,
    text: `${deployedPackagesCount} packages were deployed to a preview environment (preview-${number})`,
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
