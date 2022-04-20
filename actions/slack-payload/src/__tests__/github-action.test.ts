import * as actionsCore from '@actions/core';
import * as payload from '@src/libs/slack-payload';
import * as context from '@src/libs/workflow-context';
import { WorkflowData } from '@src/libs/workflow-context/types';
import { run } from '../github-action';

jest.mock('@src/libs/workflow-context');
jest.mock('@src/libs/slack-payload');

const mockedPayload = 'Message to slack';
const mockedWorkflowContext = {} as WorkflowData;
const mockedToken = 'token';

describe('github action', () => {
  describe('given that there is no error', () => {
    it('should set payload as github action output', async () => {
      const getInputSpy = jest.spyOn(actionsCore, 'getInput').mockReturnValue(mockedToken);
      const setOutputSpy = jest.spyOn(actionsCore, 'setOutput').mockImplementation();
      const payloadSpy = jest.spyOn(payload, 'createPayload').mockReturnValue(mockedPayload);
      const contextSpy = jest
        .spyOn(context, 'getWorkflowContext')
        .mockResolvedValue(mockedWorkflowContext);

      await run();

      expect(getInputSpy).toHaveBeenCalledTimes(1);
      expect(getInputSpy).toHaveBeenCalledWith('token');

      expect(contextSpy).toHaveBeenCalledTimes(1);
      expect(contextSpy).toHaveBeenCalledWith(mockedToken);

      expect(payloadSpy).toHaveBeenCalledTimes(1);
      expect(payloadSpy).toHaveBeenCalledWith(mockedWorkflowContext);

      expect(setOutputSpy).toHaveBeenCalledTimes(1);
      expect(setOutputSpy).toHaveBeenCalledWith('payload', mockedPayload);
    });
  });
  describe('given that error occurs', () => {
    it('should format error payload', async () => {
      const mockedErrorPayload = 'Error message to slack';
      const mockedError = 'mockedError';

      const setOutputSpy = jest.spyOn(actionsCore, 'setOutput').mockImplementation();
      const payloadSpy = jest
        .spyOn(payload, 'createErrorPayload')
        .mockReturnValue(mockedErrorPayload);

      jest.spyOn(payload, 'createPayload').mockImplementation(() => {
        throw mockedError;
      });

      await run();

      expect(setOutputSpy).toHaveBeenCalledTimes(1);
      expect(setOutputSpy).toHaveBeenCalledWith('payload', mockedErrorPayload);

      expect(payloadSpy).toHaveBeenCalledTimes(1);
      expect(payloadSpy).toHaveBeenCalledWith(mockedError);
    });
  });
});
