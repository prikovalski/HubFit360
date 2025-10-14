-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'patient', 'nutritionist', 'trainer', 'professional');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Migrate existing roles from users table to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT auth_user_id, 
  CASE 
    WHEN role::text = 'ADMIN' THEN 'admin'::app_role
    WHEN role::text = 'PATIENT' THEN 'patient'::app_role
    WHEN role::text = 'NUTRITIONIST' THEN 'nutritionist'::app_role
    WHEN role::text = 'TRAINER' THEN 'trainer'::app_role
    WHEN role::text = 'PROFESSIONAL' THEN 'professional'::app_role
    ELSE 'patient'::app_role
  END
FROM public.users
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Update RLS policy for hotmart_transactions to use has_role function
DROP POLICY IF EXISTS "Only admins can view hotmart transactions" ON public.hotmart_transactions;
CREATE POLICY "Only admins can view hotmart transactions"
ON public.hotmart_transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user function to create user_roles entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_user_id INTEGER;
  profession_value TEXT;
  gender_value TEXT;
  city_value TEXT;
  state_value TEXT;
  city_id UUID;
  state_id UUID;
  activities_data JSONB;
  name_value TEXT;
  height_value NUMERIC;
  weight_value NUMERIC;
  neck_circ_value NUMERIC;
  waist_circ_value NUMERIC;
  hip_circ_value NUMERIC;
  goal_value TEXT;
  user_role_value TEXT;
BEGIN
  -- Validate and sanitize name (max 100 chars)
  name_value := COALESCE(new.raw_user_meta_data ->> 'name', new.email);
  IF length(name_value) > 100 THEN
    name_value := substring(name_value, 1, 100);
  END IF;
  
  -- Validate email format (already validated by auth, but extra check)
  IF new.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(new.email) > 254 THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Extract profession
  profession_value := new.raw_user_meta_data ->> 'profession';
  IF profession_value IS NOT NULL THEN
    profession_value := substring(profession_value, 1, 50);
  END IF;
  
  -- Extract and validate gender
  gender_value := new.raw_user_meta_data ->> 'gender';
  CASE gender_value
    WHEN 'Masculino' THEN gender_value := 'MALE';
    WHEN 'Feminino' THEN gender_value := 'FEMALE';
    WHEN 'Outro' THEN gender_value := 'OTHER';
    WHEN 'MALE', 'FEMALE', 'OTHER' THEN NULL;
    ELSE gender_value := NULL;
  END CASE;
  
  -- Validate city and state
  city_value := new.raw_user_meta_data ->> 'city';
  state_value := new.raw_user_meta_data ->> 'state';
  
  IF city_value IS NOT NULL AND length(city_value) > 100 THEN
    city_value := substring(city_value, 1, 100);
  END IF;
  IF state_value IS NOT NULL AND length(state_value) > 2 THEN
    state_value := substring(state_value, 1, 2);
  END IF;
  
  -- Validate physical activities JSONB
  activities_data := COALESCE(
    (new.raw_user_meta_data -> 'physicalActivities')::jsonb,
    (new.raw_user_meta_data -> 'physical_activities')::jsonb,
    '[]'::jsonb
  );
  
  IF jsonb_typeof(activities_data) != 'array' THEN
    activities_data := '[]'::jsonb;
  END IF;
  
  -- Validate numeric values
  IF new.raw_user_meta_data ->> 'height' IS NOT NULL THEN
    BEGIN
      height_value := (new.raw_user_meta_data ->> 'height')::numeric;
      IF height_value < 100 OR height_value > 250 THEN
        height_value := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      height_value := NULL;
    END;
  END IF;
  
  IF new.raw_user_meta_data ->> 'weight' IS NOT NULL THEN
    BEGIN
      weight_value := (new.raw_user_meta_data ->> 'weight')::numeric;
      IF weight_value < 30 OR weight_value > 300 THEN
        weight_value := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      weight_value := NULL;
    END;
  END IF;
  
  IF new.raw_user_meta_data ->> 'neck_circumference' IS NOT NULL THEN
    BEGIN
      neck_circ_value := (new.raw_user_meta_data ->> 'neck_circumference')::numeric;
      IF neck_circ_value < 20 OR neck_circ_value > 200 THEN
        neck_circ_value := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      neck_circ_value := NULL;
    END;
  END IF;
  
  IF new.raw_user_meta_data ->> 'waist_circumference' IS NOT NULL THEN
    BEGIN
      waist_circ_value := (new.raw_user_meta_data ->> 'waist_circumference')::numeric;
      IF waist_circ_value < 20 OR waist_circ_value > 200 THEN
        waist_circ_value := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      waist_circ_value := NULL;
    END;
  END IF;
  
  IF new.raw_user_meta_data ->> 'hip_circumference' IS NOT NULL THEN
    BEGIN
      hip_circ_value := (new.raw_user_meta_data ->> 'hip_circumference')::numeric;
      IF hip_circ_value < 20 OR hip_circ_value > 200 THEN
        hip_circ_value := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      hip_circ_value := NULL;
    END;
  END IF;
  
  goal_value := new.raw_user_meta_data ->> 'goal';
  IF goal_value IS NOT NULL AND length(goal_value) > 200 THEN
    goal_value := substring(goal_value, 1, 200);
  END IF;
  
  -- Extract role for user_roles table
  user_role_value := COALESCE(new.raw_user_meta_data ->> 'role', 'PATIENT');
  
  -- Insert user without role column
  INSERT INTO public.users (auth_user_id, name, email, gender, birth_date, profession, role)
  VALUES (
    new.id, 
    name_value,
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

  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    CASE user_role_value
      WHEN 'ADMIN' THEN 'admin'::app_role
      WHEN 'PATIENT' THEN 'patient'::app_role
      WHEN 'NUTRITIONIST' THEN 'nutritionist'::app_role
      WHEN 'TRAINER' THEN 'trainer'::app_role
      WHEN 'PROFESSIONAL' THEN 'professional'::app_role
      ELSE 'patient'::app_role
    END
  );

  -- Resolve state and city IDs
  IF state_value IS NOT NULL THEN
    SELECT id INTO state_id FROM public.estados WHERE sigla = state_value LIMIT 1;
  END IF;
  
  IF city_value IS NOT NULL THEN
    IF length(city_value) = 36 AND city_value ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      BEGIN
        city_id := city_value::UUID;
        IF NOT EXISTS (SELECT 1 FROM public.cidades WHERE id = city_id) THEN
          city_id := NULL;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        city_id := NULL;
      END;
    ELSE
      IF state_id IS NOT NULL THEN
        SELECT id INTO city_id FROM public.cidades WHERE nome = city_value AND estado_id = state_id LIMIT 1;
      ELSE
        SELECT id INTO city_id FROM public.cidades WHERE nome = city_value LIMIT 1;
      END IF;
    END IF;
  END IF;
  
  -- Create patient profile if role is PATIENT
  IF user_role_value IN ('PATIENT', 'patient') OR user_role_value IS NULL THEN
    INSERT INTO public.patient_profiles (
      user_id, estado_id, city_id, goal, height, weight,
      neck_circumference, waist_circumference, hip_circumference,
      physical_activities
    )
    VALUES (
      new_user_id, state_id, city_id,
      goal_value,
      height_value,
      weight_value,
      neck_circ_value,
      waist_circ_value,
      hip_circ_value,
      activities_data
    );
  END IF;

  -- Grant welcome bonus credits
  INSERT INTO public.user_credits (user_id, balance) VALUES (new_user_id, 1);
  INSERT INTO public.credit_transactions (user_id, type, amount, source, reference_id, description)
  VALUES (
    new_user_id, 'bonus', 1, 'system',
    CONCAT('welcome-bonus-', new_user_id),
    'Crédito de cortesia para novo usuário'
  );

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RAISE EXCEPTION 'Failed to create user profile';
END;
$function$;