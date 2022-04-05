import { Colors, SlackIcons } from '@src/enums';

export const getPullRequestPayload = (
  sha: string,
  url: string,
  title: string,
  number: number
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

export const getLogsPayload = (
  url: string,
  checkSuiteId: number,
  buildArtifactId: number,
  testArtfactId: number
): any => {
  const message = `${SlackIcons.DOWNLOADS} Download ${
    buildArtifactId
      ? `*<${url}/suites/${checkSuiteId}/artifacts/${buildArtifactId}|build logs>*`
      : ''
  } ${
    testArtfactId ? `*<${url}/suites/${checkSuiteId}/artifacts/${testArtfactId}|test logs>*` : ''
  }`;
  return {
    color: Colors.FAILURE,
    fallback: message,
    text: message,
  };
};
