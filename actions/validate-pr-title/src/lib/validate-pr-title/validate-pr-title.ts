import { ValidatePRTitleOptions } from './types';
import { createComment, getIssue } from '@src/util/github-client';
import { prTitleValidator } from '@src/util/validators';

export const validatePrTitle = async (options: ValidatePRTitleOptions): Promise<void> => {
  const { pullRequestNumber, ...rest } = options;

  const issue = await getIssue({ issueNumber: pullRequestNumber, ...rest });

  const validationResult = prTitleValidator(issue.title);

  if (!validationResult.isValid) {
    await createComment({ issueNumber: pullRequestNumber, body: validationResult.error, ...rest });
    throw new Error(validationResult.error);
  }
};
