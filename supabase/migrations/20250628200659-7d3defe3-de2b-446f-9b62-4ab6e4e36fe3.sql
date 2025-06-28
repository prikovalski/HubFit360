
-- Adicionar coluna patient_name na tabela assessments
ALTER TABLE public.assessments 
ADD COLUMN patient_name TEXT;

-- Adicionar comentário na coluna para documentação
COMMENT ON COLUMN public.assessments.patient_name IS 'Nome do paciente/aluno quando a avaliação é feita por um profissional';
