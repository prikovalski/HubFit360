-- Corrigir a função handle_new_user para processar corretamente physicalActivities
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  new_user_id INTEGER;
  profession_value TEXT;
  gender_value TEXT;
  city_name TEXT;
  state_name TEXT;
  city_id UUID;
  state_id UUID;
  activities_data JSONB;
BEGIN
  -- Obter valores dos metadados
  profession_value := new.raw_user_meta_data ->> 'profession';
  gender_value := new.raw_user_meta_data ->> 'gender';
  city_name := new.raw_user_meta_data ->> 'city';
  state_name := new.raw_user_meta_data ->> 'state';
  
  -- Obter atividades físicas (verificar ambos os nomes de campo)
  activities_data := COALESCE(
    (new.raw_user_meta_data -> 'physicalActivities')::jsonb,
    (new.raw_user_meta_data -> 'physical_activities')::jsonb,
    '[]'::jsonb
  );
  
  -- Converter valores de gênero do português para inglês
  CASE gender_value
    WHEN 'Masculino' THEN gender_value := 'MALE';
    WHEN 'Feminino' THEN gender_value := 'FEMALE';
    WHEN 'Outro' THEN gender_value := 'OTHER';
    ELSE gender_value := gender_value;
  END CASE;
  
  -- Inserir o usuário na tabela users
  INSERT INTO public.users (auth_user_id, name, email, gender, birth_date, profession, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    gender_value,
    CASE 
      WHEN new.raw_user_meta_data ->> 'birth_date' IS NOT NULL 
      THEN (new.raw_user_meta_data ->> 'birth_date')::date 
      ELSE NULL 
    END,
    CASE 
      WHEN profession_value IS NOT NULL AND profession_value != ''
      THEN profession_value::public.profession_type 
      ELSE NULL 
    END,
    COALESCE(
      (new.raw_user_meta_data ->> 'role')::public.user_role, 
      'PATIENT'::public.user_role
    )
  ) RETURNING id INTO new_user_id;

  -- Se for um paciente e tiver informações de perfil, criar o perfil
  IF (new.raw_user_meta_data ->> 'role') = 'PATIENT' OR (new.raw_user_meta_data ->> 'role') IS NULL THEN
    -- Buscar IDs de estado e cidade se fornecidos
    IF state_name IS NOT NULL THEN
      SELECT id INTO state_id FROM public.estados WHERE nome = state_name LIMIT 1;
    END IF;
    
    IF city_name IS NOT NULL AND state_id IS NOT NULL THEN
      SELECT id INTO city_id FROM public.cidades WHERE nome = city_name AND estado_id = state_id LIMIT 1;
    END IF;
    
    -- Inserir o perfil do paciente
    INSERT INTO public.patient_profiles (
      user_id, 
      estado_id, 
      city_id,
      goal,
      height,
      weight,
      neck_circumference,
      waist_circumference,
      hip_circumference,
      physical_activities
    )
    VALUES (
      new_user_id,
      state_id,
      city_id,
      new.raw_user_meta_data ->> 'goal',
      CASE 
        WHEN new.raw_user_meta_data ->> 'height' IS NOT NULL 
        THEN (new.raw_user_meta_data ->> 'height')::numeric 
        ELSE NULL 
      END,
      CASE 
        WHEN new.raw_user_meta_data ->> 'weight' IS NOT NULL 
        THEN (new.raw_user_meta_data ->> 'weight')::numeric 
        ELSE NULL 
      END,
      CASE 
        WHEN new.raw_user_meta_data ->> 'neck_circumference' IS NOT NULL 
        THEN (new.raw_user_meta_data ->> 'neck_circumference')::numeric 
        ELSE NULL 
      END,
      CASE 
        WHEN new.raw_user_meta_data ->> 'waist_circumference' IS NOT NULL 
        THEN (new.raw_user_meta_data ->> 'waist_circumference')::numeric 
        ELSE NULL 
      END,
      CASE 
        WHEN new.raw_user_meta_data ->> 'hip_circumference' IS NOT NULL 
        THEN (new.raw_user_meta_data ->> 'hip_circumference')::numeric 
        ELSE NULL 
      END,
      activities_data
    );
  END IF;

  -- Adicionar 1 crédito de cortesia para o novo usuário
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (new_user_id, 1);

  -- Registrar a transação do crédito de cortesia
  INSERT INTO public.credit_transactions (
    user_id, 
    type, 
    amount, 
    source, 
    reference_id,
    description
  )
  VALUES (
    new_user_id,
    'bonus',
    1,
    'system',
    CONCAT('welcome-bonus-', new_user_id),
    'Crédito de cortesia para novo usuário'
  );

  RETURN new;
END;
$function$;