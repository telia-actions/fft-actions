import * as actionsCore from '@actions/core';
import { when } from 'jest-when';
import * as workflowInfo from '@src/libs/workflow-info';
import { WorkflowInfo } from '@src/libs/workflow-info/types';
import { run } from '../github-action';

jest.mock('@src/libs/workflow-info');

const mockedEmail = 'noreply@telia.se';
const mockedEnvironment = 'dev'
const mockedWorkflowInfo: WorkflowInfo = { author_email: mockedEmail, environment: mockedEnvironment }
const mockedToken = 'token';
const mockedFailIfAbsent = '[author_email, environment, newAttribute]';
const mockedFailIfAbsentCorrect = '[author_email, environment]';

describe('github action', () => {
    describe('given that there is no error', () => {
        it('should set workflowInfo as github action outputs', async () => {
            const getInputSpy = jest.spyOn(actionsCore, 'getInput');
            const setFailedSpy = jest.spyOn(actionsCore, 'setFailed');
            const setOutputSpy = jest.spyOn(actionsCore, 'setOutput');

            when(getInputSpy)
                .calledWith('token')
                .mockReturnValue(mockedToken)
                .calledWith('fail_if_absent')
                .mockReturnValue(mockedFailIfAbsentCorrect)

            jest.spyOn(workflowInfo, 'getWorkflowInfo').mockResolvedValue(mockedWorkflowInfo);

            await run();

            expect(setFailedSpy).toHaveBeenCalledTimes(0);
            expect(setOutputSpy).toHaveBeenCalledTimes(2);

            expect(setOutputSpy).toHaveBeenCalledWith('environment', mockedEnvironment);
            expect(setOutputSpy).toHaveBeenCalledWith('author_email', mockedEmail);
        });
    });
    describe('given that error occurs', () => {
        it('should display error message when fail_if_absent keys are not present in workflowInfo Json', async () => {
            const mockedError = "newAttribute key does not exists in workflowInfo";

            const getInputSpy = jest.spyOn(actionsCore, 'getInput');
            const setFailedSpy = jest.spyOn(actionsCore, 'setFailed');
            const setOuputSpy = jest.spyOn(actionsCore, 'setOutput');

            when(getInputSpy)
                .calledWith('token')
                .mockReturnValue(mockedToken)
                .calledWith('fail_if_absent')
                .mockReturnValue(mockedFailIfAbsent)

            jest.spyOn(workflowInfo, 'getWorkflowInfo').mockResolvedValue(mockedWorkflowInfo)

            await run();

            expect(setFailedSpy).toHaveBeenCalledTimes(1);
            expect(setFailedSpy).toHaveBeenCalledWith(mockedError);

            expect(setOuputSpy).toHaveBeenCalledTimes(0);
        });
    });
});
