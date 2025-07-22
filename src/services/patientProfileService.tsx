import { supabase } from '@/integrations/supabase/client';

import { FormData } from '@/types/authForm';

export const createPatientProfile = async (authUserId: string, formData: FormData) => {
  try {
    console.log('=== INÍCIO DA CRIAÇÃO DO PERFIL DE PACIENTE ===');
    console.log('Auth User ID:', authUserId);
    console.log('FormData recebido:', JSON.stringify(formData, null, 2));

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

    // Como os campos de objetivo e atividades físicas foram movidos para a tela de avaliação,
    // criamos o perfil apenas com os dados básicos do cadastro
    const patientData = {
      user_id: userProfile.id,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      city_id: cityId,
      estado_id: estadoId,
      neck_circumference: formData.neckCircumference ? parseFloat(formData.neckCircumference) : null,
      waist_circumference: formData.waistCircumference ? parseFloat(formData.waistCircumference) : null,
      hip_circumference: formData.hipCircumference ? parseFloat(formData.hipCircumference) : null,
      // Os campos abaixo serão preenchidos na tela de avaliação
      goal: null,
      physical_activity: null,
      activity_frequency: null,
      physical_activities: [] as any[]
    };

    console.log('=== DADOS DO PACIENTE PARA INSERÇÃO ===');
    console.log('Dados completos:', JSON.stringify(patientData, null, 2));

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