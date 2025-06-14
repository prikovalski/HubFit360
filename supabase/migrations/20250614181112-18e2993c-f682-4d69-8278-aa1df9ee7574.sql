
-- Adicionar nova coluna para armazenar múltiplas atividades físicas em formato JSON
ALTER TABLE public.patient_profiles 
ADD COLUMN physical_activities jsonb DEFAULT '[]'::jsonb;

-- Migrar dados existentes dos campos antigos para o novo formato JSON
UPDATE public.patient_profiles 
SET physical_activities = 
  CASE 
    WHEN physical_activity IS NOT NULL AND activity_frequency IS NOT NULL THEN
      jsonb_build_array(
        jsonb_build_object(
          'type', physical_activity,
          'frequency', activity_frequency
        )
      )
    WHEN physical_activity IS NOT NULL THEN
      jsonb_build_array(
        jsonb_build_object(
          'type', physical_activity,
          'frequency', ''
        )
      )
    ELSE '[]'::jsonb
  END
WHERE physical_activities = '[]'::jsonb;
