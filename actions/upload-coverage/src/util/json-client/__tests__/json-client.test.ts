import jsonMock from '../__mocks__/mock';
import { readJsonWithComments } from '../json-client';

describe('json client utilities', () => {
  describe('readJsonWithComments method', () => {
    const path = 'src/util/json-client/__mocks__/mock-comments.json';
    it('should parse json file content', () => {
      const result = readJsonWithComments(path);
      expect(result).toEqual(jsonMock);
    });
  });
});
