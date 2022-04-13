import { Colors, GithubStatus, SlackIcons } from '@src/enums';
import type {
  SlackPayloadAttachmentBlocks,
  SlackPayloadAttachmentText,
  SlackPayloadBlockFields,
  SlackPayloadBlockText,
} from './types';

export const getHeaderBlock = (conclusion: string | null): SlackPayloadBlockText => {
  const icon = conclusion === GithubStatus.SUCCESS ? SlackIcons.SUCCESS : SlackIcons.FAILURE;
  return {
    type: 'header',
    text: {
      type: 'plain_text',
      text: `${icon} ${
        conclusion === GithubStatus.SUCCESS ? 'Successful workflow' : 'Failed workflow'
      }`,
    },
  };
};

export const getInformationBlock = (
  repositoryUrl: string,
  repositoryName: string,
  workflowUrl: string,
  workflowName: string,
  environment: string
): SlackPayloadBlockFields => {
  return {
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `<${repositoryUrl}|${repositoryName}>`,
      },
      {
        type: 'mrkdwn',
        text: `<${workflowUrl}|${workflowName}>`,
      },
      {
        type: 'plain_text',
        text: `Environment: ${environment.toUpperCase()}`,
      },
    ],
  };
};

export const getPullRequestBlock = (
  sha: string,
  url: string,
  title: string,
  number: number
): SlackPayloadBlockText => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${SlackIcons.PULL_REQUEST} <${url}|#${number} ${title}> (commit id \`${sha}\`)`,
    },
  };
};

export const getPackagesAttachment = (
  color: string,
  status: string,
  count: number
): SlackPayloadAttachmentText => {
  const message = `${count} ${status} deployments`;
  return {
    color,
    fallback: message,
    text: message,
  };
};

export const getFailureStepAttachment = (failedSteps: string[]): SlackPayloadAttachmentBlocks => {
  const message = `Workflow failed during steps:`;
  const stepsBlock = failedSteps.map<SlackPayloadBlockText>((step) => {
    return {
      type: 'section',
      text: {
        type: 'plain_text',
        text: step,
      },
    };
  });
  return {
    color: Colors.FAILURE,
    fallback: message,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: message,
        },
      },
      ...stepsBlock,
    ],
  };
};

export const getLogsAttachment = (
  url: string,
  checkSuiteId: number,
  buildArtifactId: number,
  testArtfactId: number
): SlackPayloadAttachmentText => {
  const message = `${SlackIcons.DOWNLOADS} Download ${
    buildArtifactId
      ? `<${url}/suites/${checkSuiteId}/artifacts/${buildArtifactId}|build logs> `
      : ''
  }${testArtfactId ? `<${url}/suites/${checkSuiteId}/artifacts/${testArtfactId}|test logs>` : ''}`;
  return {
    color: Colors.FAILURE,
    fallback: message,
    text: message,
  };
};
