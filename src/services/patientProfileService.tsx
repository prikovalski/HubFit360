
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { FormData } from '@/types/authForm';

export const createPatientProfile = async (authUserId: string, formData: FormData) => {
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

    // Buscar city_id se uma cidade foi fornecida
    let cityId = null;
    if (formData.city) {
      const { data: cityData, error: cityError } = await supabase
        .from('cidades')
        .select('id')
        .eq('nome', formData.city)
        .maybeSingle();

      if (!cityError && cityData) {
        cityId = cityData.id;
      }
    }

    // Criar o objeto de dados do paciente com validação
    const patientData = {
      user_id: userProfile.id,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      city_id: cityId,
      goal: formData.goal || null,
      intensity: formData.intensity || null,
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
