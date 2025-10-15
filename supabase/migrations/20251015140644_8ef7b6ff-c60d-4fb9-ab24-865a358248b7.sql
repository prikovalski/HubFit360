-- Add assessment_method column to tdah_assessments table
ALTER TABLE public.tdah_assessments 
ADD COLUMN IF NOT EXISTS assessment_method TEXT DEFAULT 'ASRS-18';

-- Add comment to column
COMMENT ON COLUMN public.tdah_assessments.assessment_method IS 'Method used for TDAH assessment (ASRS-18 or DIVA 2.0)';