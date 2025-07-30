
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { useFormData } from '@/hooks/useFormData';
import { useAuthSubmit } from '@/hooks/useAuthSubmit';
import { useEmailCheck } from '@/hooks/useEmailCheck';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils/inputValidation';

export const useAuthForm = (onLogin: (user: any) => void) => {
  const { showPasswordReset, setShowPasswordReset, handleForgotPassword, handlePasswordReset } = usePasswordReset();
  const { formData, setFormData, handleInputChange } = useFormData();
  const { handleSubmit: submitForm } = useAuthSubmit();
  const { checkEmailExists } = useEmailCheck();
  const { resendConfirmation } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

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
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log('🔧 useAuthForm: Iniciando submit', { 
      email: formData.email, 
      isLogin, 
      isMobile 
    });
    
    setLoading(true);
    setEmailError('');
    
    try {
      // Validar email antes de submeter
      const isEmailValid = await validateEmailInput(formData.email);
      if (!isEmailValid) {
        console.log('🔧 useAuthForm: Email inválido, parando submit');
        setLoading(false);
        return;
      }
      
      console.log('🔧 useAuthForm: Email válido, prosseguindo com submit');
      const result = await submitForm(formData, isLogin);
      
      console.log('🔧 useAuthForm: Resultado do submit', { 
        result, 
        isLogin, 
        isMobile 
      });
      
      // Se não for login e o cadastro foi bem-sucedido, mostrar tela de confirmação
      if (!isLogin && result) {
        console.log('🔧 useAuthForm: Mostrando confirmação de email para cadastro');
        setShowEmailConfirmation(true);
      } else if (isLogin && result) {
        console.log('🔧 useAuthForm: Login bem-sucedido, aguardando redirecionamento automático');
      }
    } catch (error) {
      console.error('🔧 useAuthForm: Erro no submit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    try {
      const { error } = await resendConfirmation(formData.email);
      
      if (error) {
        toast({
          title: "Erro ao reenviar email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email reenviado!",
          description: "Verifique sua caixa de entrada e spam.",
        });
      }
    } catch (error) {
      console.error('Error resending confirmation:', error);
      toast({
        title: "Erro ao reenviar email",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
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
    showEmailConfirmation,
    setShowEmailConfirmation,
    resendLoading,
    handleSocialLogin,
    handleForgotPassword: () => handleForgotPassword(formData.email),
    handlePasswordReset: () => handlePasswordReset(formData.email, setLoading, setEmailExists),
    handleInputChange,
    handleSubmit,
    validateEmailInput,
    handleResendConfirmation
  };
};
