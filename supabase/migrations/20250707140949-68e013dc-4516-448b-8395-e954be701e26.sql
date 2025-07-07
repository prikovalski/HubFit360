
-- Add circumference fields to assessments table for self-assessments
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS neck_circumference numeric,
ADD COLUMN IF NOT EXISTS waist_circumference numeric,
ADD COLUMN IF NOT EXISTS hip_circumference numeric;

-- Update existing assessments to have these fields available
UPDATE assessments 
SET neck_circumference = patient_neck_circumference,
    waist_circumference = patient_waist_circumference,
    hip_circumference = patient_hip_circumference
WHERE patient_neck_circumference IS NOT NULL 
   OR patient_waist_circumference IS NOT NULL 
   OR patient_hip_circumference IS NOT NULL;
