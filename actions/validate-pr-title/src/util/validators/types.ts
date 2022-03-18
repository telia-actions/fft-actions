export type ValidationResult = ValidationSuccess | ValidationFail;

export interface ValidationSuccess {
  isValid: true;
}

export interface ValidationFail {
  isValid: false;
  error: string;
}
