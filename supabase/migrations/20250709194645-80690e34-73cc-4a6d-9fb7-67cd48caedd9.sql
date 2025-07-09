-- Add prompt column to assessments table
ALTER TABLE public.assessments 
ADD COLUMN prompt_text TEXT;