import { getInput, setFailed } from '@actions/core';
import { RushPackage } from '@src/types';
import { writeCoverageToRds } from '@src/lib/write-coverage-to-rds';

export const run = async (): Promise<void> => {
  try {
    const region = getInput('region');
    const secretArn = getInput('secretArn');
    const resourceArn = getInput('resourceArn');
    const database = getInput('database');
    const table = getInput('table');
    const rushProjectsInput = getInput('rushProjects');
    const rushProjects: RushPackage[] = JSON.parse(rushProjectsInput);

    await writeCoverageToRds({
      database,
      resourceArn,
      region,
      rushProjects,
      secretArn,
      table,
    });
  } catch (error: any) {
    setFailed(error.message);
  }
};
