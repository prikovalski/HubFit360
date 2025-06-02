
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { FormData } from '@/types/authForm';

export const useAuthForm = (onLogin: (user: any) => void) => {
  const { signUp, signIn, checkEmailExists } = useAuth();
  const { showPasswordReset, setShowPasswordReset, handleForgotPassword, handlePasswordReset } = usePasswordReset();
  
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    gender: '',
    birthDate: '',
    weight: '',
    height: '',
    city: '',
    goal: '',
    chronicDisease: '',
    medicalRestriction: '',
    foodAllergy: '',
    avoidFood: '',
    physicalActivity: '',
    activityFrequency: '',
    fixedMealTimes: '',
    mustHaveFood: '',
    neckCircumference: '',
    waistCircumference: '',
    hipCircumference: ''
  });

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `Login com ${provider}`,
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        if (data.user) {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta!"
          });
          onLogin(data.user);
        }
      } else {
        if (step === 1) {
          console.log('Verificando se email existe:', formData.email);
          const emailAlreadyExists = await checkEmailExists(formData.email);
          console.log('Resultado da verificação:', emailAlreadyExists);
          
          if (emailAlreadyExists) {
            setEmailExists(true);
            return;
          }
          
          setStep(step + 1);
        } else if (step < 4) {
          setStep(step + 1);
        } else {
          // Final step - create the user with proper metadata mapping
          console.log('Creating user with form data:', formData);
          const { data, error } = await signUp(formData.email, formData.password, {
            name: formData.name,
            gender: formData.gender,
            birth_date: formData.birthDate,
            email_confirm: false
          });

          if (error) {
            toast({
              title: "Erro no cadastro",
              description: error.message,
              variant: "destructive"
            });
            return;
          }

          if (data.user) {
            toast({
              title: "Cadastro realizado com sucesso!",
              description: "Bem-vindo ao HubFit360!"
            });
            
            onLogin(data.user);
          }
        }
      }
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isLogin,
    setIsLogin,
    step,
    setStep,
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
