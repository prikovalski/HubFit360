
-- Adicionar coluna city_id na tabela patient_profiles
ALTER TABLE patient_profiles 
ADD COLUMN city_id uuid REFERENCES cidades(id);

-- Remover a coluna city antiga (após confirmar que não há dados importantes)
ALTER TABLE patient_profiles 
DROP COLUMN city;
