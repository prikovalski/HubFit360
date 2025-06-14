
-- Adicionar coluna estado_id na tabela patient_profiles
ALTER TABLE patient_profiles 
ADD COLUMN estado_id uuid REFERENCES estados(id);
