
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { useFormData } from '@/hooks/useFormData';
import { useAuth } from '@/hooks/useAuth';
import { validateAuthEmail } from '@/utils/authValidation';

export const useAuthForm = (onLogin: (user: any) => void) => {
  const { formData, setFormData, handleInputChange } = useFormData();
  const { 
    signUp, 
    signIn, 
    checkEmailExists, 
    resendConfirmation, 
    resetPassword,
    authLoading 
  } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [emailExists, setEmailExists] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const validateEmailInput = async (email: string) => {
    setEmailError('');
    
    // Validação básica de formato
    const emailValidation = validateAuthEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Email inválido');
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
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setEmailError('');
    
    try {
      // Validar email antes de submeter
      const isEmailValid = await validateEmailInput(formData.email);
      if (!isEmailValid) {
        return;
      }
      
      let result;
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
        if (result.data && !result.error) {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta!",
          });
        }
      } else {
        // Preparar metadados do usuário para signup
        const userRole = formData.userType === 'professional' ? 'PROFESSIONAL' : 'PATIENT';
        const userMetadata: any = {
          name: formData.name,
          gender: formData.gender,
          birth_date: formData.birthDate,
          user_type: formData.userType,
          role: userRole
        };

        if (formData.userType === 'professional' && formData.profession) {
          userMetadata.profession = formData.profession;
        }

        if (formData.userType === 'patient') {
          userMetadata.city = formData.city;
          userMetadata.state = formData.state;
          userMetadata.goal = formData.goal;
          userMetadata.physical_activities = formData.physicalActivities;
          
          if (formData.weight) userMetadata.weight = formData.weight;
          if (formData.height) userMetadata.height = formData.height;
          if (formData.neckCircumference) userMetadata.neck_circumference = formData.neckCircumference;
          if (formData.waistCircumference) userMetadata.waist_circumference = formData.waistCircumference;
          if (formData.hipCircumference) userMetadata.hip_circumference = formData.hipCircumference;
        }

        result = await signUp(formData.email, formData.password, userMetadata);
        
        if (result.data && !result.error) {
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Verifique seu email para confirmar a conta.",
          });
          setShowEmailConfirmation(true);
        }
      }
      
      if (result.error) {
        toast({
          title: isLogin ? "Erro no login" : "Erro no cadastro",
          description: result.error.message || "Ocorreu um erro inesperado",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: isLogin ? "Erro no login" : "Erro no cadastro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
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

  const handleForgotPassword = () => {
    if (!formData.email) {
      toast({
        title: "Email necessário",
        description: "Por favor, insira seu email primeiro",
        variant: "destructive"
      });
      return;
    }
    setShowPasswordReset(true);
  };

  const handlePasswordReset = async () => {
    try {
      const result = await resetPassword(formData.email);
      
      if (result.error) {
        toast({
          title: "Erro",
          description: result.error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Email enviado!",
        description: `Verifique sua caixa de entrada (${formData.email}) para redefinir sua senha.`
      });
      
      setShowPasswordReset(false);
      setEmailExists(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o email de recuperação",
        variant: "destructive"
      });
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
    loading: authLoading,
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
    handleForgotPassword,
    handlePasswordReset,
    handleInputChange,
    handleSubmit,
    validateEmailInput,
    handleResendConfirmation
  };
};
