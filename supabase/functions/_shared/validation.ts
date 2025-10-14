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

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}