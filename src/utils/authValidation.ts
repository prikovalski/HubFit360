import { validateEmail, validatePassword } from '@/utils/inputValidation';

export interface AuthValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

// Centralized auth validations
export const validateAuthEmail = (email: string): AuthValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }
  
  if (!validateEmail(email)) {
    return { isValid: false, error: 'Por favor, insira um email válido' };
  }
  
  return { isValid: true };
};

export const validateAuthPassword = (password: string): PasswordValidationResult => {
  if (!password) {
    return { isValid: false, errors: ['Senha é obrigatória'] };
  }
  
  return validatePassword(password);
};

export const validateLoginForm = (email: string, password: string): AuthValidationResult => {
  const emailValidation = validateAuthEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória' };
  }
  
  return { isValid: true };
};

export const validateSignupForm = (email: string, password: string): AuthValidationResult => {
  const emailValidation = validateAuthEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  const passwordValidation = validateAuthPassword(password);
  if (!passwordValidation.isValid) {
    return { isValid: false, error: passwordValidation.errors.join(', ') };
  }
  
  return { isValid: true };
};