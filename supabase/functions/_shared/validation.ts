// Input validation utilities for edge functions

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validateNumber(
  value: number,
  min: number,
  max: number
): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}

export function validateString(
  value: string,
  minLength: number = 0,
  maxLength: number = 1000
): boolean {
  return typeof value === 'string' && value.length >= minLength && value.length <= maxLength;
}

export function validateUUID(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function validateHeight(height: number): boolean {
  return validateNumber(height, 100, 250); // cm
}

export function validateWeight(weight: number): boolean {
  return validateNumber(weight, 30, 300); // kg
}

export function validateAge(age: number): boolean {
  return validateNumber(age, 13, 120); // years
}

export function validateCircumference(circumference: number): boolean {
  return validateNumber(circumference, 20, 200); // cm
}

export function validateGender(gender: string): boolean {
  const validGenders = ['male', 'female', 'MALE', 'FEMALE', 'masculino', 'feminino', 'Masculino', 'Feminino'];
  return validGenders.includes(gender);
}

export function validateTDAHResponse(response: number): boolean {
  return validateNumber(response, 0, 4);
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export interface ValidationError {
  field: string;
  message: string;
}

export function createValidationError(field: string, message: string): ValidationError {
  return { field, message };
}