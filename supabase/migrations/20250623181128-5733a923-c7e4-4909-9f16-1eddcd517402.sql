
-- Adicionar campo tier na tabela assessments
ALTER TABLE public.assessments 
ADD COLUMN tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'premium'));

-- Atualizar avaliações existentes que têm assessment_text como premium
UPDATE public.assessments 
SET tier = 'premium' 
WHERE assessment_text IS NOT NULL AND assessment_text != '';
