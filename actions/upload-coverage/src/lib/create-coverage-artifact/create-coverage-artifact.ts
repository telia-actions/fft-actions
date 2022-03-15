import { calculateTotalCoverage, getCoverageForPackage } from '@telia/collect-test-coverage';
import { uploadArtifact } from '@src/util/artifact-client';
import { writefile } from '@src/util/file-client';
import { RushPackage } from '@src/types';

export const COVERAGE_ARTIFACT_NAME = 'coverage';
export const COVERAGE_FILE_NAME = 'coverage.json';

export const createCoverageArtifact = async (rushPackages: RushPackage[]): Promise<void> => {
  const coverageReports = rushPackages.map((pkg) =>
    getCoverageForPackage({
      name: pkg.packageName,
      path: pkg.projectFolder,
    })
  );
  const totalCoverage = calculateTotalCoverage(coverageReports);

  writefile(COVERAGE_FILE_NAME, JSON.stringify(totalCoverage, null,2));

  await uploadArtifact(COVERAGE_ARTIFACT_NAME, [COVERAGE_FILE_NAME], '.');
};
