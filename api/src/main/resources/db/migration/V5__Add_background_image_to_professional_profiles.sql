-- V5__Add_background_image_to_professional_profiles.sql

-- Adicionar campo background_image na tabela professional_profiles
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS background_image VARCHAR(500);

-- Comentário para o campo
COMMENT ON COLUMN professional_profiles.background_image IS 'URL da imagem de fundo do perfil profissional';