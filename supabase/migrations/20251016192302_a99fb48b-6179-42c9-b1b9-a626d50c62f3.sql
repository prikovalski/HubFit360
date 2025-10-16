-- Add columns for Pollock 7-fold method to assessments table
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS measurement_method text DEFAULT 'navy' CHECK (measurement_method IN ('navy', 'pollock_7')),
ADD COLUMN IF NOT EXISTS chest_fold numeric,
ADD COLUMN IF NOT EXISTS midaxillary_fold numeric,
ADD COLUMN IF NOT EXISTS triceps_fold numeric,
ADD COLUMN IF NOT EXISTS subscapular_fold numeric,
ADD COLUMN IF NOT EXISTS abdominal_fold numeric,
ADD COLUMN IF NOT EXISTS suprailiac_fold numeric,
ADD COLUMN IF NOT EXISTS thigh_fold numeric;

COMMENT ON COLUMN public.assessments.measurement_method IS 'Method used for body composition: navy (circumferences) or pollock_7 (7 skinfolds)';
COMMENT ON COLUMN public.assessments.chest_fold IS 'Chest skinfold measurement in mm (Pollock method)';
COMMENT ON COLUMN public.assessments.midaxillary_fold IS 'Midaxillary skinfold measurement in mm (Pollock method)';
COMMENT ON COLUMN public.assessments.triceps_fold IS 'Triceps skinfold measurement in mm (Pollock method)';
COMMENT ON COLUMN public.assessments.subscapular_fold IS 'Subscapular skinfold measurement in mm (Pollock method)';
COMMENT ON COLUMN public.assessments.abdominal_fold IS 'Abdominal skinfold measurement in mm (Pollock method)';
COMMENT ON COLUMN public.assessments.suprailiac_fold IS 'Suprailiac skinfold measurement in mm (Pollock method)';
COMMENT ON COLUMN public.assessments.thigh_fold IS 'Thigh skinfold measurement in mm (Pollock method)';