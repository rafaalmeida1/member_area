-- Migração para simplificar o esquema de cores do tema
-- Remove colunas antigas e adiciona novas colunas simplificadas

-- Adicionar novas colunas
ALTER TABLE professional_profiles 
ADD COLUMN theme_text_primary_color VARCHAR(7) DEFAULT '#2C2C2C',
ADD COLUMN theme_hover_color VARCHAR(7) DEFAULT '#F0F0F0',
ADD COLUMN theme_disabled_color VARCHAR(7) DEFAULT '#CCCCCC';

-- Atualizar dados existentes
UPDATE professional_profiles 
SET 
    theme_text_primary_color = COALESCE(theme_text_color, '#2C2C2C'),
    theme_hover_color = COALESCE(theme_muted_color, '#F0F0F0'),
    theme_disabled_color = '#CCCCCC'
WHERE theme_text_color IS NOT NULL OR theme_muted_color IS NOT NULL;

-- Remover colunas antigas
ALTER TABLE professional_profiles 
DROP COLUMN IF EXISTS theme_accent_color,
DROP COLUMN IF EXISTS theme_text_color,
DROP COLUMN IF EXISTS theme_muted_color,
DROP COLUMN IF EXISTS theme_shadow_color,
DROP COLUMN IF EXISTS theme_overlay_color; 