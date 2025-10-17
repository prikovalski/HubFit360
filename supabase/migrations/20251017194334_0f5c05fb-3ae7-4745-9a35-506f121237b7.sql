-- Remover colunas de dobras cutâneas da tabela assessments
ALTER TABLE public.assessments 
DROP COLUMN IF EXISTS chest_fold,
DROP COLUMN IF EXISTS midaxillary_fold,
DROP COLUMN IF EXISTS triceps_fold,
DROP COLUMN IF EXISTS subscapular_fold,
DROP COLUMN IF EXISTS abdominal_fold,
DROP COLUMN IF EXISTS suprailiac_fold,
DROP COLUMN IF EXISTS thigh_fold;