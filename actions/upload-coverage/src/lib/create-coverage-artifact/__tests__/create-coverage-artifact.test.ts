import {
  COVERAGE_ARTIFACT_NAME,
  COVERAGE_FILE_NAME,
  createCoverageArtifact,
} from '../create-coverage-artifact';
import * as fileClient from '@src/util/file-client';
import * as artifactClient from '@src/util/artifact-client';
import * as collectTestCoverage from '@telia/collect-test-coverage';
import { RushPackage } from '@src/types';
import { CoverageReport, PackageCoverage } from '@telia/collect-test-coverage';

jest.mock('@telia/collect-test-coverage');
jest.mock('@src/util/file-client');
jest.mock('@src/util/artifact-client');

describe('createCoverageArtifact', () => {
  const rushPackages: RushPackage[] = [
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

  const coverageReport: CoverageReport = {
    lines: category,
    branches: category,
    functions: category,
    statements: category,
    untestedPackages: ['app1'],
    numUntestedPackages: 1,
  };

  const writefileSpy = jest.spyOn(fileClient, 'writefile');
  const uploadArtifactSpy = jest.spyOn(artifactClient, 'uploadArtifact');
  const getCoverageForPackageSpy = jest.spyOn(collectTestCoverage, 'getCoverageForPackage');
  const calculateTotalCoverageSpy = jest.spyOn(collectTestCoverage, 'calculateTotalCoverage');

  it('should set full config output', async () => {
    getCoverageForPackageSpy.mockReturnValue(packageCoverage);
    calculateTotalCoverageSpy.mockReturnValue(coverageReport);

    await createCoverageArtifact(rushPackages);

    expect(getCoverageForPackageSpy).toHaveBeenCalledTimes(2);
    expect(getCoverageForPackageSpy).toHaveBeenCalledWith({
      name: rushPackages[0].packageName,
      path: rushPackages[0].projectFolder,
    });
    expect(getCoverageForPackageSpy).toHaveBeenCalledWith({
      name: rushPackages[1].packageName,
      path: rushPackages[1].projectFolder,
    });

    expect(calculateTotalCoverageSpy).toHaveBeenCalledTimes(1);
    expect(calculateTotalCoverageSpy).toHaveBeenCalledWith([packageCoverage, packageCoverage]);

    expect(writefileSpy).toHaveBeenCalledTimes(1);
    expect(writefileSpy).toHaveBeenCalledWith(
      COVERAGE_FILE_NAME,
      JSON.stringify(coverageReport, null, 2)
    );

    expect(uploadArtifactSpy).toHaveBeenCalledTimes(1);
    expect(uploadArtifactSpy).toHaveBeenCalledWith(
      COVERAGE_ARTIFACT_NAME,
      [COVERAGE_FILE_NAME],
      '.'
    );
  });
});
