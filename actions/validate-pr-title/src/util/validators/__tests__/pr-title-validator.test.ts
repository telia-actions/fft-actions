import { prTitleValidator } from '..';

describe('prTitleValidator', () => {
  it.each([
    ['PROJ description', false],
    ['PROJ- description', false],
    ['PROJ-12 description', true],
    ['PROJ-12description', false],
    ['PROJ-LONG-12 description', false],
    ['proj-12 description', false],
    ['PROJ-12description', false],
    ['description PROJ-12', false],
    ['P-12 description', false],
    ['PROJ-1 description', true],
    ['PROJ-1a description', false],
    ['PROJ-1.2 description', true],
    ['PROj-12 description', false],
    ['PROJ2-12 description', false],
    ['PROJ-1+2 description', true],
    ['#1 description', true],
    ['#12 description', true],
    ['#12description', false],
    ['#1.2 description', true],
    ['#12a description', false],
    ['#proj description', false],
    ['#2-5 description', true],
    ['#2-5description', true],
  ])('should validate %p and return %p', (title, expected) => {
    const result = prTitleValidator(title);

    expect(result.isValid).toEqual(expected);
  });
});
