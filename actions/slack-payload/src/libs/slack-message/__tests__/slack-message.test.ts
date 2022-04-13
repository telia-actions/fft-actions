import { Colors, GithubStatus, SlackIcons } from '@src/enums';
import {
  getFailureStepAttachment,
  getHeaderBlock,
  getInformationBlock,
  getLogsAttachment,
  getPackagesAttachment,
  getPullRequestBlock,
} from '../slack-message';

const mockedUrl = 'first-mocked-url';
const mockedUrl2 = 'second-mocked-url';
const mockedName = 'first-mocked-name';
const mockedName2 = 'second-mocked-name';
const mockedSha = 'sha';
const mockedTitle = 'title';
const mockedNumber = 1;

describe('slack-message', () => {
  describe('getHeaderBlock method', () => {
    describe('given conclusion is "success"', () => {
      it('should return success header payload', () => {
        const payload = getHeaderBlock(GithubStatus.SUCCESS);

        expect(payload.type).toBe('header');
        expect(payload.text.type).toBe('plain_text');
        expect(payload.text.text).toBe(`${SlackIcons.SUCCESS} Successful workflow`);
      });
    });
    describe('given conclusion is "failue"', () => {
      it('should return success header payload', () => {
        const payload = getHeaderBlock(GithubStatus.FAILURE);

        expect(payload.type).toBe('header');
        expect(payload.text.type).toBe('plain_text');
        expect(payload.text.text).toBe(`${SlackIcons.FAILURE} Failed workflow`);
      });
    });
  });
  describe('getInformationBlock method', () => {
    it('should return information payload', () => {
      const mockedEnvironment = 'test';
      const payload = getInformationBlock(
        mockedUrl,
        mockedName,
        mockedUrl2,
        mockedName2,
        mockedEnvironment
      );

      expect(payload.type).toBe('section');
      expect(payload.fields.length).toBe(3);

      expect(payload.fields[0].type).toBe('mrkdwn');
      expect(payload.fields[0].text).toBe(`<${mockedUrl}|${mockedName}>`);

      expect(payload.fields[1].type).toBe('mrkdwn');
      expect(payload.fields[1].text).toBe(`<${mockedUrl2}|${mockedName2}>`);

      expect(payload.fields[2].type).toBe('plain_text');
      expect(payload.fields[2].text).toBe(`Environment: ${mockedEnvironment.toUpperCase()}`);
    });
  });
  describe('getPullRequestBlock method', () => {
    it('should return pull request payload', () => {
      const payload = getPullRequestBlock(mockedSha, mockedUrl, mockedTitle, mockedNumber);

      expect(payload.type).toBe('section');
      expect(payload.text.type).toBe('mrkdwn');
      expect(payload.text.text).toBe(
        `${SlackIcons.PULL_REQUEST} <${mockedUrl}|#${mockedNumber} ${mockedTitle}> (commit id \`${mockedSha}\`)`
      );
    });
  });
  describe('getPackagesAttachment method', () => {
    it('should return packages payload', () => {
      const payload = getPackagesAttachment(Colors.SUCCESS, GithubStatus.SUCCESS, mockedNumber);
      const mockedMessage = `${mockedNumber} ${GithubStatus.SUCCESS} deployments`;

      expect(payload.color).toBe(Colors.SUCCESS);
      expect(payload.fallback).toBe(mockedMessage);
      expect(payload.text).toBe(mockedMessage);
    });
  });
  describe('getLogsAttachment method', () => {
    describe('given buildArtifactId is provided', () => {
      it('should return logs payload with only build logs url', () => {
        const payload = getLogsAttachment(mockedUrl, mockedNumber, mockedNumber, 0);
        const buildLogMessage = `<${mockedUrl}/suites/${mockedNumber}/artifacts/${mockedNumber}|build logs>`;
        const mockedMessage = `${SlackIcons.DOWNLOADS} Download ${buildLogMessage} `;

        expect(payload.color).toBe(Colors.FAILURE);
        expect(payload.fallback).toBe(mockedMessage);
        expect(payload.text).toBe(mockedMessage);
      });
    });
    describe('given testArtfactId is provided', () => {
      it('should return logs payload with only test logs url', () => {
        const payload = getLogsAttachment(mockedUrl, mockedNumber, 0, mockedNumber);
        const testLogMessage = `<${mockedUrl}/suites/${mockedNumber}/artifacts/${mockedNumber}|test logs>`;
        const mockedMessage = `${SlackIcons.DOWNLOADS} Download ${testLogMessage}`;

        expect(payload.color).toBe(Colors.FAILURE);
        expect(payload.fallback).toBe(mockedMessage);
        expect(payload.text).toBe(mockedMessage);
      });
    });
    describe('given buildArtifactId and testArtfactId is provided', () => {
      it('should return logs payload with build logs and test logs url', () => {
        const payload = getLogsAttachment(mockedUrl, mockedNumber, mockedNumber, mockedNumber);
        const buildLogMessage = `<${mockedUrl}/suites/${mockedNumber}/artifacts/${mockedNumber}|build logs>`;
        const testLogMessage = `<${mockedUrl}/suites/${mockedNumber}/artifacts/${mockedNumber}|test logs>`;
        const mockedMessage = `${SlackIcons.DOWNLOADS} Download ${buildLogMessage} ${testLogMessage}`;

        expect(payload.color).toBe(Colors.FAILURE);
        expect(payload.fallback).toBe(mockedMessage);
        expect(payload.text).toBe(mockedMessage);
      });
    });
  });
  describe('getFailureStepAttachment method', () => {
    it('should return failed steps payload', () => {
      const mockedStepFailures = ['build'];
      const payload = getFailureStepAttachment(mockedStepFailures);
      const mockedMessage = `Workflow failed during steps:`;

      expect(payload.color).toBe(Colors.FAILURE);
      expect(payload.fallback).toBe(mockedMessage);
      expect(payload.blocks.length).toBe(2);

      expect(payload.blocks[0].text.type).toBe('plain_text');
      expect(payload.blocks[0].text.text).toBe(mockedMessage);

      expect(payload.blocks[1].text.type).toBe('plain_text');
      expect(payload.blocks[1].text.text).toBe(mockedStepFailures[0]);
    });
  });
});
