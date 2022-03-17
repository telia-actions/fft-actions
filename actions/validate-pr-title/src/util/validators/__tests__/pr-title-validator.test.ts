import { prTitleValidator } from '..';

describe('prTitleValidator', () => {
  it.each([
    ['PROJ-12', true],
    ['proj-12', false],
    ['P-12', false],
    ['PROJ-1', true],
    ['PROJ-1a', false],
    ['PROJ-1.2', true],
    ['PROj-12', false],
    ['PROJ2-12', false],
    ['PROJ-1+2', true],
    ['#1', true],
    ['#12', true],
    ['#1.2', true],
    ['#12a', false],
    ['#proj', false],
    ['#2-5', true],
  ])('should validate %p and return %p', (title, expected) => {
    const result = prTitleValidator(title);

    expect(result.isValid).toEqual(expected);
  });
});
