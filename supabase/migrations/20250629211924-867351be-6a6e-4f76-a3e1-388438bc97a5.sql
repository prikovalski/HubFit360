
-- Criar enum para profissões da área da saúde
CREATE TYPE profession_type AS ENUM (
  'NUTRICIONISTA',
  'MEDICO',
  'EDUCADOR_FISICO',
  'FISIOTERAPEUTA',
  'ENFERMEIRO',
  'PSICOLOGO',
  'FARMACEUTICO',
  'BIOMEDICO',
  'DENTISTA',
  'TERAPEUTA_OCUPACIONAL'
);

-- Adicionar coluna profession na tabela users
ALTER TABLE users ADD COLUMN profession profession_type;

-- Atualizar o enum user_role para incluir PROFESSIONAL
ALTER TYPE user_role ADD VALUE 'PROFESSIONAL';
