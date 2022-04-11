import { Colors, GithubStatus } from '@src/enums';
import {
  getFailureStep,
  getHeaderBlock,
  getInformationBlock,
  getLogsPayload,
  getPackagesPayload,
  getPullRequestPayload,
} from '@src/utils/slack-message';
import type { WorkflowData } from '@src/libs/workflow-context/types';

export const createPayload = (workflowData: WorkflowData): string => {
  const blocks = [];
  const attachments = [];

  blocks.push(getHeaderBlock(workflowData.conclusion));
  blocks.push(
    getInformationBlock(
      workflowData.repository.url,
      workflowData.repository.name,
      workflowData.url,
      workflowData.name,
      workflowData.environment
    )
  );
  if (workflowData.pullRequest) {
    blocks.push(
      getPullRequestPayload(
        workflowData.sha,
        workflowData.pullRequest.url,
        workflowData.pullRequest.title,
        workflowData.pullRequest.number
      )
    );
  }
  if (workflowData.jobsOutcome.successDeployCount !== 0) {
    attachments.push(
      getPackagesPayload(
        Colors.SUCCESS,
        GithubStatus.SUCCESS,
        workflowData.jobsOutcome.successDeployCount
      )
    );
  }
  if (workflowData.jobsOutcome.failureDeployCount !== 0) {
    attachments.push(
      getPackagesPayload(
        Colors.FAILURE,
        GithubStatus.FAILURE,
        workflowData.jobsOutcome.failureDeployCount
      )
    );
  }
  if (workflowData.jobsOutcome.failedJobSteps.length > 0) {
    attachments.push(getFailureStep(workflowData.jobsOutcome.failedJobSteps));
    attachments.push(
      getLogsPayload(
        workflowData.repository.url,
        workflowData.checkSuiteId,
        workflowData.attachmentsIds.buildLogsArtifactId,
        workflowData.attachmentsIds.testLogsArtifactId
      )
    );
  }

  const payload = {
    blocks,
    attachments,
  };
  return JSON.stringify(payload);
};
