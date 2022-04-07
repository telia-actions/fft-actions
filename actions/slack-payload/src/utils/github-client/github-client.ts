import { context, getOctokit } from '@actions/github';
import type { WorkflowRunEvent } from '@octokit/webhooks-types';
import { GithubStatus } from '@src/enums';
import { readFile, writeFile } from '../file-client';
import { unzipArtifact } from '../tar/archive-artifact';
import type { AttachmentsData, JobsData, PullRequestData, WorkflowData } from './types';

const getPullRequestData = async (token: string, pullNumber: number): Promise<PullRequestData> => {
  const client = getOctokit(token);
  const pullRequest = await client.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pullNumber,
  });
  return { title: pullRequest.data.title, url: pullRequest.data.html_url, number: pullNumber };
};

const getAttachmentsData = async (token: string, runId: number): Promise<AttachmentsData> => {
  const client = getOctokit(token);
  const attachments = await client.rest.actions.listWorkflowRunArtifacts({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: runId,
  });
  const map = new Map<string, keyof AttachmentsData>([
    ['build-logs', 'buildLogsArtifactId'],
    ['test-logs', 'testLogsArtifactId'],
    ['environment', 'environmentArtifactId'],
  ]);
  return attachments.data.artifacts.reduce(
    (acc, artifact) => {
      const mappedValue = map.get(artifact.name);
      if (mappedValue) acc[mappedValue] = artifact.id;
      return acc;
    },
    {
      buildLogsArtifactId: 0,
      testLogsArtifactId: 0,
      environmentArtifactId: 0,
    }
  );
};

export const getWorkflowContext = async (token: string): Promise<WorkflowData> => {
  const workflowRunContext = context.payload as WorkflowRunEvent;
  const pullRequestNumber = workflowRunContext.workflow_run.pull_requests[0].number;

  const attachmentsData = await getAttachmentsData(token, workflowRunContext.workflow_run.id);
  const jobsData = await getJobsData(token, workflowRunContext.workflow_run.id);
  const pullRequestData = pullRequestNumber
    ? await getPullRequestData(token, pullRequestNumber)
    : undefined;
  const environment = pullRequestNumber
    ? `preview-${pullRequestNumber}`
    : await getDataFromArtifact(token, attachmentsData.environmentArtifactId, 'environment');

  return {
    attachmentsIds: { ...attachmentsData },
    checkSuiteId: workflowRunContext.workflow_run.check_suite_id,
    conclusion: workflowRunContext.workflow_run.conclusion,
    environment,
    jobsOutcome: { ...jobsData },
    name: workflowRunContext.workflow_run.name,
    pullRequest: { ...pullRequestData },
    repository: {
      name: workflowRunContext.repository.name,
      url: workflowRunContext.repository.html_url,
    },
    runId: workflowRunContext.workflow_run.id,
    sha: workflowRunContext.workflow_run.head_sha.substring(0, 8),
    url: workflowRunContext.workflow_run.html_url,
  };
};

const getJobsData = async (token: string, runId: number): Promise<JobsData> => {
  const client = getOctokit(token);
  const workflow = await client.rest.actions.listJobsForWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: runId,
  });
  console.log(workflow.data.jobs);
  return workflow.data.jobs.reduce<JobsData>(
    (acc, job) => {
      const isDeployJob = job.name.startsWith('deploy');
      if (job.conclusion === GithubStatus.FAILURE) {
        if (!isDeployJob && job.steps) {
          console.log(job.steps);
          const failedStep = job.steps.find((step) => step.conclusion === GithubStatus.FAILURE);
          console.log(failedStep);
          if (failedStep) {
            acc.failedJobSteps.push(failedStep.name);
          }
        }
        if (isDeployJob) acc.failureDeployCount = acc.failureDeployCount + 1;
      } else if (isDeployJob && job.conclusion === GithubStatus.SUCCESS) {
        acc.successDeployCount = acc.successDeployCount + 1;
      }
      return acc;
    },
    {
      successDeployCount: 0,
      failureDeployCount: 0,
      failedJobSteps: [],
    }
  );
};

export const getDataFromArtifact = async (
  token: string,
  artifactId: number,
  filename: string
): Promise<string> => {
  const client = getOctokit(token);
  const zip = await client.rest.actions.downloadArtifact({
    owner: context.repo.owner,
    repo: context.repo.repo,
    artifact_id: artifactId,
    archive_format: 'zip',
  });
  writeFile(`${filename}.zip`, Buffer.from(zip.data as ArrayBuffer));
  await unzipArtifact(filename);
  return readFile(`${filename}.txt`);
};
