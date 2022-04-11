import { Colors, GithubStatus, SlackIcons } from '@src/enums';
import type { SlackPayloadAttachment, SlackPayloadBlock } from './types';

export const getPullRequestPayload = (
  sha: string,
  url: string,
  title: string,
  number: number
): SlackPayloadBlock => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${SlackIcons.PULL_REQUEST} <${url}|#${number} ${title}> (commit id \`${sha}\`)`,
    },
  };
};

export const getPackagesPayload = (
  color: string,
  status: string,
  count: number
): SlackPayloadAttachment => {
  const message = `${count} ${status} deployments`;
  return {
    color,
    fallback: message,
    text: message,
  };
};

export const getInformationBlock = (
  repositoryUrl: string,
  repositoryName: string,
  workflowUrl: string,
  workflowName: string,
  environment: string
): SlackPayloadBlock => {
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

export const getLogsPayload = (
  url: string,
  checkSuiteId: number,
  buildArtifactId: number,
  testArtfactId: number
): SlackPayloadAttachment => {
  const message = `${SlackIcons.DOWNLOADS} Download ${
    buildArtifactId ? `<${url}/suites/${checkSuiteId}/artifacts/${buildArtifactId}|build logs>` : ''
  } ${testArtfactId ? `<${url}/suites/${checkSuiteId}/artifacts/${testArtfactId}|test logs>` : ''}`;
  return {
    color: Colors.FAILURE,
    fallback: message,
    text: message,
  };
};

export const getFailureStep = (failedSteps: string[]): SlackPayloadAttachment => {
  const message = `Workflow failed during steps:`;
  const stepsBlock = failedSteps.map<SlackPayloadBlock>((step) => {
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

export const getHeaderBlock = (conclusion: string | null): SlackPayloadBlock => {
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
