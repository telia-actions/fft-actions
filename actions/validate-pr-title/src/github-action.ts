import { getInput, info, setFailed } from '@actions/core';
import { validatePrTitle } from '@src/lib/validate-pr-title';

export const run = async (): Promise<void> => {
  try {
    const token = getInput('token');
    const owner = getInput('owner');
    const repository = getInput('repository');
    const pullRequestNumber = getInput('pullRequestNumber');

    info(
      JSON.stringify(
        {
          token,
          owner,
          repository,
          pullRequestNumber: Number(pullRequestNumber),
        },
        null,
        2
      )
    );

    await validatePrTitle({
      token,
      owner,
      repository,
      pullRequestNumber: Number(pullRequestNumber),
    });
  } catch (error: any) {
    setFailed(error.message);
  }
};
