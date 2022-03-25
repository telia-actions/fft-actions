import * as awsRdsClient from '@src/util/aws-rds-client';
import * as collectTestCoverage from '@telia/collect-test-coverage';
import { RushPackage } from '@src/types';
import { PackageCoverage } from '@telia/collect-test-coverage';
import { writeCoverageToRds } from '@src/lib/write-coverage-to-rds';
import { mockPartial } from '@src/util/mocks';
import { AwsRdsClient } from '@src/util/aws-rds-client';
import { when } from 'jest-when';

jest.mock('@telia/collect-test-coverage');
jest.mock('@src/util/aws-rds-client');

describe('writeCoverageToRds', () => {
  const region = 'region';
  const secretArn = 'secretArn';
  const resourceArn = 'resourceArn';
  const database = 'database';
  const table = 'table';

  const rushProjects: RushPackage[] = [
    {
      packageName: 'packageName1',
      projectFolder: 'projectFolder1',
    },
    {
      packageName: 'packageName2',
      projectFolder: 'projectFolder2',
    },
  ];

  const category = {
    total: 5,
    covered: 2,
    skipped: 2,
    pct: 12.12,
  };

  const packageCoverage: PackageCoverage = {
    package: 'package',
    coverage: {
      lines: category,
      branches: category,
      functions: category,
      statements: category,
    },
  };

  const rdsClient = mockPartial<AwsRdsClient>({
    executeBatchStatement: jest.fn(),
  });

  const createAwsRdsClientSpy = jest.spyOn(awsRdsClient, 'createAwsRdsClient');
  const getCoverageForPackageSpy = jest.spyOn(collectTestCoverage, 'getCoverageForPackage');

  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2020, 11, 11));
  });

  it('should write coverage to rds', async () => {
    getCoverageForPackageSpy.mockReturnValue(packageCoverage);
    createAwsRdsClientSpy.mockReturnValue(rdsClient);

    const timestamp = new Date().toISOString();

    await writeCoverageToRds({
      rushProjects,
      region,
      secretArn,
      resourceArn,
      database,
      table,
    });

    expect(getCoverageForPackageSpy).toHaveBeenCalledTimes(2);
    expect(getCoverageForPackageSpy).toHaveBeenCalledWith({
      name: rushProjects[0].packageName,
      path: rushProjects[0].projectFolder,
    });
    expect(getCoverageForPackageSpy).toHaveBeenCalledWith({
      name: rushProjects[1].packageName,
      path: rushProjects[1].projectFolder,
    });

    expect(rdsClient.executeBatchStatement).toHaveBeenCalledTimes(1);
    expect(rdsClient.executeBatchStatement).toHaveBeenCalledWith({
      parameterSets: [
        [
          {
            name: 'project',
            value: {
              stringValue: 'package',
            },
          },
          {
            name: 'line_coverage_pct',
            value: {
              doubleValue: category.pct,
            },
          },
        ],
        [
          {
            name: 'project',
            value: {
              stringValue: 'package',
            },
          },
          {
            name: 'line_coverage_pct',
            value: {
              doubleValue: category.pct,
            },
          },
        ],
      ],
      sql: `insert into table (timestamp, project, line_coverage_pct) VALUES ('${timestamp}', :project, :line_coverage_pct)`,
    });
  });

  it('should skip coverage reports with unknown values', async () => {
    const packageCoverageWithUnknown: PackageCoverage = {
      package: 'package',
      coverage: {
        lines: {
          ...category,
          pct: 'Unknown',
        },
        branches: category,
        functions: category,
        statements: category,
      },
    };

    when(getCoverageForPackageSpy)
      .calledWith({
        name: rushProjects[0].packageName,
        path: rushProjects[0].projectFolder,
      })
      .mockReturnValue(packageCoverage)
      .calledWith({
        name: rushProjects[1].packageName,
        path: rushProjects[1].projectFolder,
      })
      .mockReturnValue(packageCoverageWithUnknown);

    createAwsRdsClientSpy.mockReturnValue(rdsClient);

    const timestamp = new Date().toISOString();

    await writeCoverageToRds({
      rushProjects,
      region,
      secretArn,
      resourceArn,
      database,
      table,
    });

    expect(rdsClient.executeBatchStatement).toHaveBeenCalledTimes(1);
    expect(rdsClient.executeBatchStatement).toHaveBeenCalledWith({
      parameterSets: [
        [
          {
            name: 'project',
            value: {
              stringValue: 'package',
            },
          },
          {
            name: 'line_coverage_pct',
            value: {
              doubleValue: category.pct,
            },
          },
        ],
      ],
      sql: `insert into table (timestamp, project, line_coverage_pct) VALUES ('${timestamp}', :project, :line_coverage_pct)`,
    });
  });
});
