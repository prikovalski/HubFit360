-- Create Big Five assessments table
CREATE TABLE IF NOT EXISTS public.big_five_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER NOT NULL,
  patient_name TEXT,
  patient_gender TEXT,
  patient_age INTEGER,
  patient_birth_date DATE,
  assessment_type TEXT NOT NULL DEFAULT 'self',
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  scores JSONB,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'completed',
  classification TEXT,
  recommendations TEXT,
  full_report TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.big_five_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own Big Five assessments"
  ON public.big_five_assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = big_five_assessments.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own Big Five assessments"
  ON public.big_five_assessments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = big_five_assessments.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own Big Five assessments"
  ON public.big_five_assessments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = big_five_assessments.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own Big Five assessments"
  ON public.big_five_assessments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = big_five_assessments.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_big_five_assessments_updated_at
  BEFORE UPDATE ON public.big_five_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();