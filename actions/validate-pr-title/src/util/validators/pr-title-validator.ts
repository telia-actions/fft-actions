import { ValidationResult } from './types';

export const GH_PATTERN = /^[A-Z]{2,}-\d+\b/;
export const JIRA_PATTERN = /^#\d+\b/;

export const prTitleValidator = (title: string): ValidationResult => {
  const isValid = [GH_PATTERN, JIRA_PATTERN].some((pattern) => pattern.test(title));

  if (isValid) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: `Pull request title "${title}" is invalid.`,
  };
};
