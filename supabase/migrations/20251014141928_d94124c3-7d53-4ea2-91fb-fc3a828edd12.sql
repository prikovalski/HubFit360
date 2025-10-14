-- Fix search_path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id INTEGER;
  profession_value TEXT;
  gender_value TEXT;
  city_value TEXT;
  state_value TEXT;
  city_id UUID;
  state_id UUID;
  activities_data JSONB;
BEGIN
  profession_value := new.raw_user_meta_data ->> 'profession';
  gender_value := new.raw_user_meta_data ->> 'gender';
  city_value := new.raw_user_meta_data ->> 'city';
  state_value := new.raw_user_meta_data ->> 'state';
  
  activities_data := COALESCE(
    (new.raw_user_meta_data -> 'physicalActivities')::jsonb,
    (new.raw_user_meta_data -> 'physical_activities')::jsonb,
    '[]'::jsonb
  );
  
  CASE gender_value
    WHEN 'Masculino' THEN gender_value := 'MALE';
    WHEN 'Feminino' THEN gender_value := 'FEMALE';
    WHEN 'Outro' THEN gender_value := 'OTHER';
    ELSE gender_value := gender_value;
  END CASE;
  
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

  IF state_value IS NOT NULL THEN
    SELECT id INTO state_id FROM public.estados WHERE sigla = state_value LIMIT 1;
  END IF;
  
  IF city_value IS NOT NULL THEN
    IF length(city_value) = 36 AND city_value ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      city_id := city_value::UUID;
    ELSE
      IF state_id IS NOT NULL THEN
        SELECT id INTO city_id FROM public.cidades WHERE nome = city_value AND estado_id = state_id LIMIT 1;
      ELSE
        SELECT id INTO city_id FROM public.cidades WHERE nome = city_value LIMIT 1;
      END IF;
    END IF;
  END IF;
  
  IF (new.raw_user_meta_data ->> 'role') = 'PATIENT' OR (new.raw_user_meta_data ->> 'role') IS NULL THEN
    INSERT INTO public.patient_profiles (
      user_id, estado_id, city_id, goal, height, weight,
      neck_circumference, waist_circumference, hip_circumference,
      physical_activities
    )
    VALUES (
      new_user_id, state_id, city_id,
      new.raw_user_meta_data ->> 'goal',
      CASE WHEN new.raw_user_meta_data ->> 'height' IS NOT NULL 
        THEN (new.raw_user_meta_data ->> 'height')::numeric ELSE NULL END,
      CASE WHEN new.raw_user_meta_data ->> 'weight' IS NOT NULL 
        THEN (new.raw_user_meta_data ->> 'weight')::numeric ELSE NULL END,
      CASE WHEN new.raw_user_meta_data ->> 'neck_circumference' IS NOT NULL 
        THEN (new.raw_user_meta_data ->> 'neck_circumference')::numeric ELSE NULL END,
      CASE WHEN new.raw_user_meta_data ->> 'waist_circumference' IS NOT NULL 
        THEN (new.raw_user_meta_data ->> 'waist_circumference')::numeric ELSE NULL END,
      CASE WHEN new.raw_user_meta_data ->> 'hip_circumference' IS NOT NULL 
        THEN (new.raw_user_meta_data ->> 'hip_circumference')::numeric ELSE NULL END,
      activities_data
    );
  END IF;

  INSERT INTO public.user_credits (user_id, balance) VALUES (new_user_id, 1);
  INSERT INTO public.credit_transactions (user_id, type, amount, source, reference_id, description)
  VALUES (
    new_user_id, 'bonus', 1, 'system',
    CONCAT('welcome-bonus-', new_user_id),
    'Crédito de cortesia para novo usuário'
  );

  -- Add default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$$;