
-- Expandir a tabela assessments para armazenar dados completos do paciente
ALTER TABLE public.assessments 
ADD COLUMN patient_gender TEXT,
ADD COLUMN patient_birth_date DATE,
ADD COLUMN patient_city_id UUID,
ADD COLUMN patient_estado_id UUID,
ADD COLUMN patient_height NUMERIC,
ADD COLUMN patient_weight NUMERIC,
ADD COLUMN patient_neck_circumference NUMERIC,
ADD COLUMN patient_waist_circumference NUMERIC,
ADD COLUMN patient_hip_circumference NUMERIC,
ADD COLUMN patient_goal TEXT,
ADD COLUMN patient_chronic_disease TEXT,
ADD COLUMN patient_medical_restriction TEXT,
ADD COLUMN patient_food_allergy TEXT,
ADD COLUMN patient_avoid_food TEXT,
ADD COLUMN patient_fixed_meal_times TEXT,
ADD COLUMN patient_must_have_food TEXT,
ADD COLUMN patient_physical_activity TEXT,
ADD COLUMN patient_physical_activities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN assessment_type TEXT DEFAULT 'self' CHECK (assessment_type IN ('self', 'patient'));

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.assessments.assessment_type IS 'Tipo de avaliação: self (própria) ou patient (para outra pessoa)';
COMMENT ON COLUMN public.assessments.patient_gender IS 'Gênero do paciente quando assessment_type = patient';
COMMENT ON COLUMN public.assessments.patient_birth_date IS 'Data de nascimento do paciente quando assessment_type = patient';
COMMENT ON COLUMN public.assessments.patient_height IS 'Altura do paciente em cm quando assessment_type = patient';
COMMENT ON COLUMN public.assessments.patient_weight IS 'Peso do paciente em kg quando assessment_type = patient';
