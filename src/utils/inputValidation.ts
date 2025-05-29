
// Input validation utilities for security
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }
  
  if (password.length > 128) {
    errors.push('A senha deve ter no máximo 128 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100 && /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim());
};

export const validateAge = (age: number): boolean => {
  return age >= 13 && age <= 120;
};

export const validateHeight = (height: number): boolean => {
  return height >= 100 && height <= 250; // cm
};

export const validateWeight = (weight: number): boolean => {
  return weight >= 30 && weight <= 300; // kg
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Apenas arquivos JPEG, PNG e WebP são permitidos'
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'O arquivo deve ter no máximo 5MB'
    };
  }
  
  return { isValid: true };
};
