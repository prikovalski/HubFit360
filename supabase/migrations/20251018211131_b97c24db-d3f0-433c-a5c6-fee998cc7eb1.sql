-- Tornar fotos opcionais na tabela pollock_assessments
ALTER TABLE pollock_assessments 
  ALTER COLUMN front_photo DROP NOT NULL,
  ALTER COLUMN side_photo DROP NOT NULL,
  ALTER COLUMN back_photo DROP NOT NULL;