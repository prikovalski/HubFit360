
import { supabase } from '@/integrations/supabase/client';

export const useAuthSubmit = () => {
  const submitSignup = async (formData: any) => {
    console.log('=== INÍCIO DO PROCESSO DE CADASTRO ===');
    console.log('FormData recebido:', JSON.stringify(formData, null, 2));

    const redirectUrl = `${window.location.origin}/`;
    console.log('URL de redirecionamento:', redirectUrl);

    // Determinar o role baseado no tipo de usuário
    const userRole = formData.userType === 'professional' ? 'PROFESSIONAL' : 'PATIENT';
    
    // Preparar metadados do usuário
    const userMetadata: any = {
      name: formData.name,
      gender: formData.gender,
      birth_date: formData.birthDate,
      user_type: formData.userType,
      role: userRole
    };

    // Adicionar profissão se for profissional
    if (formData.userType === 'professional' && formData.profession) {
      userMetadata.profession = formData.profession;
    }

    // Para pacientes, incluir todos os dados de saúde
    if (formData.userType === 'patient') {
      userMetadata.weight = formData.weight;
      userMetadata.height = formData.height;
      userMetadata.city = formData.city;
      userMetadata.state = formData.state;
      userMetadata.goal = formData.goal;
      userMetadata.chronic_disease = formData.chronicDisease;
      userMetadata.medical_restriction = formData.medicalRestriction;
      userMetadata.food_allergy = formData.foodAllergy;
      userMetadata.avoid_food = formData.avoidFood;
      userMetadata.physical_activities = formData.physicalActivities;
      userMetadata.fixed_meal_times = formData.fixedMealTimes;
      userMetadata.must_have_food = formData.mustHaveFood;
      userMetadata.neck_circumference = formData.neckCircumference;
      userMetadata.waist_circumference = formData.waistCircumference;
      userMetadata.hip_circumference = formData.hipCircumference;
    }

    console.log('Metadados do usuário:', userMetadata);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userMetadata
      }
    });

    if (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }

    console.log('Cadastro realizado com sucesso:', data);
    return data;
  };

  const submitLogin = async (email: string, password: string) => {
    console.log('=== TENTATIVA DE LOGIN ===');
    console.log('Email:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Erro no login:', error);
      throw error;
    }

    console.log('Login realizado com sucesso:', data);
    return data;
  };

  return {
    submitSignup,
    submitLogin
  };
};
