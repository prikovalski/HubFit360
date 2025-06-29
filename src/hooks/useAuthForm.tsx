
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { useFormData } from '@/hooks/useFormData';
import { useAuthSubmit } from '@/hooks/useAuthSubmit';

export const useAuthForm = (onLogin: (user: any) => void) => {
  const { showPasswordReset, setShowPasswordReset, handleForgotPassword, handlePasswordReset } = usePasswordReset();
  const { formData, setFormData, handleInputChange } = useFormData();
  const { handleSubmit: submitForm } = useAuthSubmit();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
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
    formData,
    setFormData,
    handleSocialLogin,
    handleForgotPassword: () => handleForgotPassword(formData.email),
    handlePasswordReset: () => handlePasswordReset(formData.email, setLoading, setEmailExists),
    handleInputChange,
    handleSubmit
  };
};
