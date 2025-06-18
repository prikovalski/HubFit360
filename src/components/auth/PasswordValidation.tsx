
import React from 'react';
import { Check, X } from 'lucide-react';
import { validatePassword } from '@/utils/inputValidation';

interface PasswordValidationProps {
  password: string;
  className?: string;
}

export const PasswordValidation = ({ password, className = '' }: PasswordValidationProps) => {
  const { isValid, errors } = validatePassword(password);
  
  const criteria = [
    {
      label: 'Pelo menos 8 caracteres',
      met: password.length >= 8,
      test: (pwd: string) => pwd.length >= 8
    },
    {
      label: 'Máximo 128 caracteres',
      met: password.length <= 128,
      test: (pwd: string) => pwd.length <= 128
    },
    {
      label: 'Uma letra maiúscula',
      met: /[A-Z]/.test(password),
      test: (pwd: string) => /[A-Z]/.test(pwd)
    },
    {
      label: 'Uma letra minúscula',
      met: /[a-z]/.test(password),
      test: (pwd: string) => /[a-z]/.test(pwd)
    },
    {
      label: 'Um número',
      met: /\d/.test(password),
      test: (pwd: string) => /\d/.test(pwd)
    },
    {
      label: 'Um caractere especial (!@#$%^&*(),.?":{}|<>)',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
  ];

  if (!password) {
    return null;
  }

  return (
    <div className={`mt-3 p-3 bg-gray-50 rounded-lg border ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Requisitos da senha:
      </h4>
      <div className="space-y-1">
        {criteria.map((criterion, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
              criterion.met 
                ? 'text-green-600' 
                : password.length > 0 
                  ? 'text-red-500' 
                  : 'text-gray-500'
            }`}
          >
            {criterion.met ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{criterion.label}</span>
          </div>
        ))}
      </div>
      
      {password.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className={`text-sm font-medium ${
            isValid ? 'text-green-600' : 'text-red-500'
          }`}>
            {isValid ? '✓ Senha válida' : `${errors.length} requisito(s) não atendido(s)`}
          </div>
        </div>
      )}
    </div>
  );
};
