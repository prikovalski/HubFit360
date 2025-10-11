-- Criar tabela para avaliações de TDAH
CREATE TABLE public.tdah_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER NOT NULL,
  patient_name TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  patient_birth_date DATE,
  assessment_type TEXT NOT NULL DEFAULT 'adult',
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER,
  classification TEXT,
  recommendations TEXT,
  full_report TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tdah_assessments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tdah_assessments
CREATE POLICY "Users can view their own TDAH assessments"
ON public.tdah_assessments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = tdah_assessments.user_id
  AND users.auth_user_id = auth.uid()
));

CREATE POLICY "Users can create their own TDAH assessments"
ON public.tdah_assessments
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = tdah_assessments.user_id
  AND users.auth_user_id = auth.uid()
));

CREATE POLICY "Users can update their own TDAH assessments"
ON public.tdah_assessments
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = tdah_assessments.user_id
  AND users.auth_user_id = auth.uid()
));

CREATE POLICY "Users can delete their own TDAH assessments"
ON public.tdah_assessments
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = tdah_assessments.user_id
  AND users.auth_user_id = auth.uid()
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tdah_assessments_updated_at
BEFORE UPDATE ON public.tdah_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar coluna assessment_type na tabela credit_transactions (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'credit_transactions' 
    AND column_name = 'assessment_type'
  ) THEN
    ALTER TABLE public.credit_transactions 
    ADD COLUMN assessment_type TEXT DEFAULT 'physical';
  END IF;
END $$;