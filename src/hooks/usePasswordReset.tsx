
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const usePasswordReset = () => {
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleForgotPassword = (email: string) => {
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Por favor, insira seu email primeiro",
        variant: "destructive"
      });
      return;
    }
    setShowPasswordReset(true);
  };

  const handlePasswordReset = async (email: string, setLoading: (loading: boolean) => void, setEmailExists: (exists: boolean) => void) => {
    setLoading(true);
    try {
      // Use a more specific redirect URL to avoid conflicts
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log('Sending password reset email with redirect URL:', redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('Error sending password reset email:', error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Password reset email sent successfully');
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha."
      });
      
      setShowPasswordReset(false);
      setEmailExists(false);
    } catch (error) {
      console.error('Unexpected error in password reset:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o email de recuperação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    showPasswordReset,
    setShowPasswordReset,
    handleForgotPassword,
    handlePasswordReset
  };
};
