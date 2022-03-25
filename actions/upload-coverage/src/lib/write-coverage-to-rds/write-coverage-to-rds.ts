import { getCoverageForPackage } from '@telia/collect-test-coverage';
import { createAwsRdsClient, ParameterSet } from '@src/util/aws-rds-client';
import { WriteToRDSOptions } from './types';

export const writeCoverageToRds = async (options: WriteToRDSOptions): Promise<void> => {
  const { rushProjects, table, ...rdsOptions } = options;

  const coverageReports = rushProjects.map((pkg) =>
    getCoverageForPackage({
      name: pkg.packageName,
      path: pkg.projectFolder,
    })
  );

  const rdsClient = createAwsRdsClient(rdsOptions);

  const timestamp = new Date().toISOString();

  const sql = `insert into ${table} (timestamp, project, line_coverage_pct) VALUES ('${timestamp}', :project, :line_coverage_pct)`;

  const parameterSets = coverageReports.reduce<ParameterSet[]>((acc, coverage) => {
    if (coverage.coverage.lines.pct === 'Unknown') {
      return acc;
    }

    const item = [
      {
        name: 'project',
        value: { stringValue: coverage.package },
      },
      {
        name: 'line_coverage_pct',
        value: { doubleValue: coverage.coverage.lines.pct },
      },
    ];

    return [...acc, item];
  }, []);

  await rdsClient.executeBatchStatement({ sql, parameterSets });
};
