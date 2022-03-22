import type { PullRequestEvent } from '@octokit/webhooks-types';
import { GithubStatus, SlackIcons } from '@src/enums';
import type { WorkflowData } from '@src/utils/github/types';

export const createPullRequestPayload = (
  context: PullRequestEvent,
  workflow: WorkflowData,
  deployedPackagesCount: number
): string => {
  const { number, title, html_url, merge_commit_sha } = context.pull_request;
  const workflowIcon =
    workflow.status === GithubStatus.SUCCESS ? SlackIcons.SUCCESS : SlackIcons.FAILURE;
  const blocks = [];
  const attachments = [];
  const titleBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${workflowIcon} <${context.repository.html_url}| ${context.repository.name}`,
    },
  };
  const dividerBlock = {
    type: 'divider',
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
    fallback: `${deployedPackagesCount} packages were deployed to a preview environment (preview-${number})`,
    text: `${deployedPackagesCount} packages were deployed to a preview environment (preview-${number})`,
    footer:
      'mocked_package_1, mocked_package_2, mocked_package_3, mocked_package_4, mocked_package_5, mocked_package_6',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'mocked_package_1',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'mocked_package_2',
        },
      },
    ],
  };
  blocks.push(titleBlock);
  blocks.push(dividerBlock);
  blocks.push(infoBlock);
  attachments.push(packagesAttachments);
  const payload = {
    blocks,
    attachments,
  };
  return JSON.stringify(payload);
};
