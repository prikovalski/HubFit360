
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { FormData, PhysicalActivity } from '@/types/authForm';

export const createPatientProfile = async (authUserId: string, formData: FormData) => {
  try {
    console.log('=== INÍCIO DA CRIAÇÃO DO PERFIL DE PACIENTE ===');
    console.log('Auth User ID:', authUserId);
    console.log('FormData recebido:', JSON.stringify(formData, null, 2));
    console.log('Atividades físicas:', formData.physicalActivities);
    console.log('Tipo das atividades físicas:', typeof formData.physicalActivities);
    console.log('É array?', Array.isArray(formData.physicalActivities));

    // Aguardar um pouco para garantir que o trigger criou o registro na tabela users
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Buscar o user_id da tabela users usando o auth_user_id com melhor tratamento
    let userProfile = null;
    let attempts = 0;
    const maxAttempts = 6;

    while (!userProfile && attempts < maxAttempts) {
      console.log(`Tentativa ${attempts + 1} de buscar perfil do usuário`);
      
      try {
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

    // Buscar estado_id se um estado foi fornecido
    let estadoId = null;
    if (formData.state) {
      console.log('Buscando estado por sigla:', formData.state);
      const { data: estadoData, error: estadoError } = await supabase
        .from('estados')
        .select('id')
        .eq('sigla', formData.state)
        .maybeSingle();

      if (!estadoError && estadoData) {
        estadoId = estadoData.id;
        console.log('Estado encontrado:', estadoId);
      } else {
        console.error('Erro ao buscar estado:', estadoError);
      }
    }

    // Buscar city_id se uma cidade foi fornecida (agora já deve ser o ID)
    let cityId = null;
    if (formData.city) {
      // Se formData.city for um UUID (ID da cidade), usar diretamente
      // Se for um nome, buscar na tabela
      if (formData.city.length > 10) { // Provavelmente é um UUID
        cityId = formData.city;
        console.log('Usando city_id diretamente:', cityId);
      } else {
        console.log('Buscando cidade por nome:', formData.city);
        const { data: cityData, error: cityError } = await supabase
          .from('cidades')
          .select('id')
          .eq('nome', formData.city)
          .maybeSingle();

        if (!cityError && cityData) {
          cityId = cityData.id;
          console.log('Cidade encontrada:', cityId);
        } else {
          console.error('Erro ao buscar cidade:', cityError);
        }
      }
    }

    // Validar e processar atividades físicas
    let physicalActivitiesForDB: PhysicalActivity[] = [];
    if (formData.physicalActivities && Array.isArray(formData.physicalActivities)) {
      physicalActivitiesForDB = formData.physicalActivities.filter(activity => 
        activity && activity.type && activity.type.trim() !== ''
      );
      console.log('Atividades físicas processadas para o DB:', physicalActivitiesForDB);
    } else {
      console.log('Nenhuma atividade física válida encontrada');
    }

    // Converter atividades físicas para Json compatível com Supabase
    const physicalActivitiesJson = physicalActivitiesForDB.length > 0 
      ? JSON.parse(JSON.stringify(physicalActivitiesForDB)) 
      : [];

    console.log('=== CONVERSÃO PARA JSON ===');
    console.log('Atividades originais:', physicalActivitiesForDB);
    console.log('Atividades convertidas para JSON:', physicalActivitiesJson);
    console.log('Tipo das atividades convertidas:', typeof physicalActivitiesJson);

    // Criar o objeto de dados do paciente com validação
    const patientData = {
      user_id: userProfile.id,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      city_id: cityId,
      estado_id: estadoId,
      goal: formData.goal || null,
      chronic_disease: formData.chronicDisease || null,
      medical_restriction: formData.medicalRestriction || null,
      food_allergy: formData.foodAllergy || null,
      avoid_food: formData.avoidFood || null,
      physical_activity: formData.physicalActivity || null,
      activity_frequency: formData.activityFrequency || null,
      physical_activities: physicalActivitiesJson as any, // Cast explícito para Json
      fixed_meal_times: formData.fixedMealTimes || null,
      must_have_food: formData.mustHaveFood || null,
      neck_circumference: formData.neckCircumference ? parseFloat(formData.neckCircumference) : null,
      waist_circumference: formData.waistCircumference ? parseFloat(formData.waistCircumference) : null,
      hip_circumference: formData.hipCircumference ? parseFloat(formData.hipCircumference) : null
    };

    console.log('=== DADOS DO PACIENTE PARA INSERÇÃO ===');
    console.log('Dados completos:', JSON.stringify(patientData, null, 2));
    console.log('Atividades físicas específicas:', patientData.physical_activities);
    console.log('Quantidade de atividades:', Array.isArray(patientData.physical_activities) ? patientData.physical_activities.length : 0);
    console.log('Tipo final das atividades:', typeof patientData.physical_activities);

    // Verificar se já existe um perfil de paciente para este usuário
    const { data: existingProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userProfile.id);

    if (existingProfile && existingProfile.length > 0) {
      const { data: updateData, error: updateError } = await supabase
        .from('patient_profiles')
        .update(patientData)
        .eq('user_id', userProfile.id)
        .select();

      if (updateError) {
        console.error('Erro ao atualizar perfil de paciente:', updateError);
        throw updateError;
      }
      console.log('Perfil de paciente atualizado com sucesso:', updateData);
    } else {
      console.log('Criando novo perfil de paciente...');
      const { data: insertData, error: insertError } = await supabase
        .from('patient_profiles')
        .insert(patientData)
        .select();

      if (insertError) {
        console.error('Erro ao criar perfil de paciente:', insertError);
        console.error('Detalhes do erro:', JSON.stringify(insertError, null, 2));
        throw insertError;
      }
      console.log('Perfil de paciente criado com sucesso:', insertData);
    }

    // Verificar se os dados foram salvos corretamente
    const { data: verificationData, error: verificationError } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('user_id', userProfile.id)
      .single();

    if (verificationError) {
      console.error('Erro ao verificar dados salvos:', verificationError);
    } else {
      console.log('=== VERIFICAÇÃO DOS DADOS SALVOS ===');
      console.log('Dados salvos no banco:', JSON.stringify(verificationData, null, 2));
      console.log('Atividades físicas salvas:', verificationData.physical_activities);
      console.log('Tipo das atividades salvas:', typeof verificationData.physical_activities);
      console.log('Quantidade de atividades salvas:', Array.isArray(verificationData.physical_activities) ? verificationData.physical_activities.length : 0);
    }

    console.log('=== FIM DA CRIAÇÃO DO PERFIL DE PACIENTE ===');

  } catch (error) {
    console.error('=== ERRO NA CRIAÇÃO DO PERFIL DE PACIENTE ===');
    console.error('Erro detalhado:', error);
    console.error('Stack trace:', error.stack);
    
    // Re-throw o erro para que seja tratado no nível superior
    throw error;
  }
};
