import * as artifact from '@actions/artifact';
import { ArtifactClient } from '@actions/artifact/lib/internal/artifact-client';
import { ArtifactMeta } from '../types';
import { mockPartial } from '@src/util/mocks';
import { uploadArtifact } from '../artifact-client';

jest.mock('@actions/artifact');

describe('services artifact client', () => {
  describe('uploadArtifact', () => {
    it('should upload artifact to github', async () => {
      const artifactName = 'artifactName';
      const files = ['file1', 'file2'];
      const rootDir = 'rootDir';

      const artifactResult = mockPartial<ArtifactMeta>({
        packageName: 'packageName',
      });

      const client = mockPartial<ArtifactClient>({
        uploadArtifact: jest.fn().mockResolvedValue(artifactResult),
      });

      const createSpy = jest.spyOn(artifact, 'create').mockReturnValue(client);

      const result = await uploadArtifact(artifactName, files, rootDir);

      expect(result).toEqual(artifactResult);

      expect(createSpy).toHaveBeenCalledTimes(1);

      expect(client.uploadArtifact).toHaveBeenCalledTimes(1);
      expect(client.uploadArtifact).toHaveBeenCalledWith(artifactName, files, rootDir, undefined);
    });
  });
});
