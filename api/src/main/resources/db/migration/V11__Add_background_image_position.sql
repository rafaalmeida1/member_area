-- Adiciona posição da imagem de fundo do perfil profissional (em porcentagem)
ALTER TABLE professional_profiles
    ADD COLUMN IF NOT EXISTS background_position_x INTEGER DEFAULT 50,
    ADD COLUMN IF NOT EXISTS background_position_y INTEGER DEFAULT 50;

-- Garantir limites razoáveis (0 a 100)
UPDATE professional_profiles
SET background_position_x = 50
WHERE background_position_x IS NULL OR background_position_x < 0 OR background_position_x > 100;

UPDATE professional_profiles
SET background_position_y = 50
WHERE background_position_y IS NULL OR background_position_y < 0 OR background_position_y > 100;
