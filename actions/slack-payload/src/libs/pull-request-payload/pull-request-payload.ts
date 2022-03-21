import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';
import { GithubStatus, SlackIcons } from '@src/enums';
import type { WorkflowData } from '@src/utils/github/types';

export const createPullRequestPayload = (
  context: PullRequestEvent,
  workflow: WorkflowData,
  deployedPackages: string[]
): string => {
  const { number, title, html_url, merge_commit_sha } = context.pull_request;
  const workflowIcon =
    workflow.status === GithubStatus.SUCCESS ? SlackIcons.SUCCESS : SlackIcons.FAILURE;
  const blocks = [];
  const attachments = [];
  const titleBlock = {
    type: 'header',
    text: {
      type: 'mrkdwn',
      text: `${workflowIcon} <${context.repository.html_url}| ${context.repository.name}`,
    },
  };
  const infoBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: ` *<${html_url}|#${number} ${title}>* (commit id \`${merge_commit_sha}\`)`,
    },
  };
  const packagesAttachments = {
    color: '#808080',
    fallback: `${deployedPackages.length} packages were deployed to a preview environment (preview-${number})`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${deployedPackages.length} packages were deployed to a preview environment (preview-${number})`,
        },
      },
      deployedPackages.map((packageName) => {
        return {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: packageName,
          },
        };
      }),
    ],
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
