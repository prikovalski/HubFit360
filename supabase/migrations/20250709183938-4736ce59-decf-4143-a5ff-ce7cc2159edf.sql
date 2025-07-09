-- Criar o enum profession_type que está faltando no banco
CREATE TYPE public.profession_type AS ENUM (
  'NUTRICIONISTA',
  'MEDICO', 
  'EDUCADOR_FISICO',
  'FISIOTERAPEUTA',
  'ENFERMEIRO',
  'PSICOLOGO',
  'FARMACEUTICO',
  'BIOMEDICO',
  'DENTISTA',
  'TERAPEUTA_OCUPACIONAL'
);

-- Criar o enum user_role se não existir
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('PATIENT', 'ADMIN', 'NUTRITIONIST', 'TRAINER', 'PROFESSIONAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;