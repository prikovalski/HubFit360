-- Create pollock_assessments table for skinfold assessments
CREATE TABLE IF NOT EXISTS public.pollock_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Assessment type (self or patient)
  assessment_type TEXT NOT NULL DEFAULT 'self' CHECK (assessment_type IN ('self', 'patient')),
  
  -- Patient data (only if assessment_type = 'patient')
  patient_name TEXT,
  patient_gender TEXT CHECK (patient_gender IN ('MALE', 'FEMALE', 'Masculino', 'Feminino')),
  patient_birth_date DATE,
  patient_height NUMERIC CHECK (patient_height >= 100 AND patient_height <= 250),
  patient_weight NUMERIC CHECK (patient_weight >= 30 AND patient_weight <= 300),
  
  -- Photos
  front_photo TEXT NOT NULL,
  side_photo TEXT NOT NULL,
  back_photo TEXT NOT NULL,
  
  -- Personal data (for self assessments)
  height NUMERIC CHECK (height >= 100 AND height <= 250),
  weight NUMERIC CHECK (weight >= 30 AND weight <= 300),
  age INTEGER CHECK (age >= 13 AND age <= 120),
  gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'Masculino', 'Feminino')),
  
  -- Seven skinfolds (in mm)
  chest_fold NUMERIC CHECK (chest_fold >= 0 AND chest_fold <= 100),
  midaxillary_fold NUMERIC CHECK (midaxillary_fold >= 0 AND midaxillary_fold <= 100),
  triceps_fold NUMERIC CHECK (triceps_fold >= 0 AND triceps_fold <= 100),
  subscapular_fold NUMERIC CHECK (subscapular_fold >= 0 AND subscapular_fold <= 100),
  abdominal_fold NUMERIC CHECK (abdominal_fold >= 0 AND abdominal_fold <= 100),
  suprailiac_fold NUMERIC CHECK (suprailiac_fold >= 0 AND suprailiac_fold <= 100),
  thigh_fold NUMERIC CHECK (thigh_fold >= 0 AND thigh_fold <= 100),
  
  -- Calculated results
  body_fat_percentage NUMERIC,
  lean_mass NUMERIC,
  fat_mass NUMERIC,
  bmi NUMERIC,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pollock_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own pollock assessments"
ON public.pollock_assessments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = pollock_assessments.user_id
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own pollock assessments"
ON public.pollock_assessments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = pollock_assessments.user_id
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own pollock assessments"
ON public.pollock_assessments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = pollock_assessments.user_id
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own pollock assessments"
ON public.pollock_assessments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = pollock_assessments.user_id
    AND users.auth_user_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_pollock_assessments_user_id ON public.pollock_assessments(user_id);
CREATE INDEX idx_pollock_assessments_created_at ON public.pollock_assessments(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_pollock_assessments_updated_at
BEFORE UPDATE ON public.pollock_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();