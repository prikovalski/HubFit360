
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { useFormData } from '@/hooks/useFormData';
import { useAuthSubmit } from '@/hooks/useAuthSubmit';
import { useEmailCheck } from '@/hooks/useEmailCheck';
import { validateEmail } from '@/utils/inputValidation';

export const useAuthForm = (onLogin: (user: any) => void) => {
  const { showPasswordReset, setShowPasswordReset, handleForgotPassword, handlePasswordReset } = usePasswordReset();
  const { formData, setFormData, handleInputChange } = useFormData();
  const { handleSubmit: submitForm } = useAuthSubmit();
  const { checkEmailExists } = useEmailCheck();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmailInput = async (email: string) => {
    setEmailError('');
    
    // Validação básica de formato
    if (!validateEmail(email)) {
      setEmailError('Por favor, insira um email válido');
      return false;
    }
    
    // Se estiver criando conta, verificar se email já existe
    if (!isLogin) {
      try {
        const exists = await checkEmailExists(email);
        if (exists) {
          setEmailExists(true);
          setEmailError('Este email já possui uma conta. Faça login ou use outro email.');
          return false;
        }
      } catch (error) {
        console.error('Erro ao verificar email:', error);
        // Continuar mesmo com erro na verificação
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setEmailError('');
    
    try {
      // Validar email antes de submeter
      const isEmailValid = await validateEmailInput(formData.email);
      if (!isEmailValid) {
        setLoading(false);
        return;
      }
      
      await submitForm(formData, isLogin);
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `Login com ${provider}`,
      description: "Funcionalidade em desenvolvimento",
    });
  };

  return {
    isLogin,
    setIsLogin,
    loading,
    showPasswordReset,
    setShowPasswordReset,
    emailExists,
    setEmailExists,
    emailError,
    setEmailError,
    formData,
    setFormData,
    handleSocialLogin,
    handleForgotPassword: () => handleForgotPassword(formData.email),
    handlePasswordReset: () => handlePasswordReset(formData.email, setLoading, setEmailExists),
    handleInputChange,
    handleSubmit,
    validateEmailInput
  };
};
