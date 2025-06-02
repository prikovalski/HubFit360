
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

  const createPatientProfile = async (userId: number) => {
    try {
      console.log('Criando perfil de paciente para usuário:', userId);
      console.log('Dados do formulário:', formData);

      const patientData = {
        user_id: userId,
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

      const { error } = await supabase
        .from('patient_profiles')
        .insert([patientData]);

      if (error) {
        console.error('Erro ao criar perfil de paciente:', error);
        throw error;
      }

      console.log('Perfil de paciente criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar perfil de paciente:', error);
      throw error;
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
            toast({
              title: "Erro no cadastro",
              description: error.message,
              variant: "destructive"
            });
            return;
          }

          if (data.user) {
            // Get the user profile ID to create patient profile
            const { data: userProfile, error: userProfileError } = await supabase
              .from('users')
              .select('id')
              .eq('auth_user_id', data.user.id)
              .single();

            if (userProfileError) {
              console.error('Erro ao buscar perfil do usuário:', userProfileError);
              toast({
                title: "Erro",
                description: "Erro ao criar perfil completo do usuário",
                variant: "destructive"
              });
              return;
            }

            // Create patient profile with all form data
            await createPatientProfile(userProfile.id);

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
