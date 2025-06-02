
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { FormData } from '@/types/authForm';
import { supabase } from '@/integrations/supabase/client';

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

  const createPatientProfile = async (authUserId: string) => {
    try {
      console.log('Criando perfil de paciente para auth_user_id:', authUserId);
      console.log('Dados do formulário:', formData);

      // Aguardar um pouco para garantir que o trigger criou o registro na tabela users
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Buscar o user_id da tabela users usando o auth_user_id com melhor tratamento
      let userProfile = null;
      let attempts = 0;
      const maxAttempts = 6;

      while (!userProfile && attempts < maxAttempts) {
        console.log(`Tentativa ${attempts + 1} de buscar perfil do usuário`);
        
        try {
          // Usar uma abordagem diferente para a consulta
          const { data, error, count } = await supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('auth_user_id', authUserId);

          console.log('Resultado da consulta users:', { data, error, count });

          if (error) {
            console.error('Erro na consulta users:', error);
            if (attempts < maxAttempts - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              attempts++;
              continue;
            } else {
              throw error;
            }
          }

          if (data && data.length > 0) {
            userProfile = data[0];
            console.log('Perfil do usuário encontrado:', userProfile);
            break;
          } else {
            console.log('Usuário ainda não encontrado, tentando novamente...');
            if (attempts < maxAttempts - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              attempts++;
              continue;
            }
          }
        } catch (err) {
          console.error('Erro na consulta:', err);
          if (attempts < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
            continue;
          } else {
            throw err;
          }
        }
      }

      if (!userProfile) {
        throw new Error('Não foi possível encontrar o perfil do usuário após várias tentativas');
      }

      // Criar o objeto de dados do paciente com validação
      const patientData = {
        user_id: userProfile.id,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        city: formData.city || null,
        goal: formData.goal || null,
        chronic_disease: formData.chronicDisease || null,
        medical_restriction: formData.medicalRestriction || null,
        food_allergy: formData.foodAllergy || null,
        avoid_food: formData.avoidFood || null,
        physical_activity: formData.physicalActivity || null,
        activity_frequency: formData.activityFrequency || null,
        fixed_meal_times: formData.fixedMealTimes || null,
        must_have_food: formData.mustHaveFood || null,
        neck_circumference: formData.neckCircumference ? parseFloat(formData.neckCircumference) : null,
        waist_circumference: formData.waistCircumference ? parseFloat(formData.waistCircumference) : null,
        hip_circumference: formData.hipCircumference ? parseFloat(formData.hipCircumference) : null
      };

      console.log('Dados do paciente a serem inseridos:', patientData);

      // Verificar se já existe um perfil de paciente para este usuário
      const { data: existingProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', userProfile.id);

      if (existingProfile && existingProfile.length > 0) {
        console.log('Perfil de paciente já existe, atualizando...');
        const { error: updateError } = await supabase
          .from('patient_profiles')
          .update(patientData)
          .eq('user_id', userProfile.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil de paciente:', updateError);
          throw updateError;
        }
      } else {
        console.log('Criando novo perfil de paciente...');
        const { error: insertError } = await supabase
          .from('patient_profiles')
          .insert([patientData]);

        if (insertError) {
          console.error('Erro ao criar perfil de paciente:', insertError);
          throw insertError;
        }
      }

      console.log('Perfil de paciente criado/atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao criar perfil de paciente:', error);
      // Não vamos fazer throw aqui para não bloquear o login
      // O usuário consegue fazer login mesmo sem o patient_profile
      toast({
        title: "Aviso",
        description: "Seu cadastro foi criado, mas alguns dados adicionais não foram salvos. Você pode completá-los mais tarde no seu perfil.",
        variant: "default"
      });
    }
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
          
          console.log('Login bem-sucedido, redirecionamento automático para dashboard');
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
          // Final step - create the user and patient profile
          console.log('Creating user with form data:', formData);
          const { data, error } = await signUp(formData.email, formData.password, {
            name: formData.name,
            gender: formData.gender,
            birth_date: formData.birthDate,
            email_confirm: false
          });

          if (error) {
            // Handle rate limiting specifically
            if (error.message?.includes('429') || error.message?.includes('Too Many Requests') || error.message?.includes('rate')) {
              toast({
                title: "Muitas tentativas",
                description: "Você fez muitas tentativas de cadastro. Aguarde alguns minutos antes de tentar novamente.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Erro no cadastro",
                description: error.message,
                variant: "destructive"
              });
            }
            return;
          }

          if (data.user) {
            // Create patient profile using the auth user id directly
            await createPatientProfile(data.user.id);

            toast({
              title: "Cadastro realizado com sucesso!",
              description: "Redirecionando para o dashboard..."
            });
            
            console.log('Cadastro bem-sucedido, redirecionamento automático para dashboard');
          }
        }
      }
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      
      // Check if it's a rate limiting error
      if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
        toast({
          title: "Limite de tentativas excedido",
          description: "Aguarde alguns minutos antes de tentar se cadastrar novamente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro inesperado",
          variant: "destructive"
        });
      }
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
