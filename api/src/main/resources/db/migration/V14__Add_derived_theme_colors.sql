-- Adicionar colunas para cores derivadas do tema
ALTER TABLE professional_profiles ADD COLUMN theme_border_color VARCHAR(7) DEFAULT '#e5e5e5';
ALTER TABLE professional_profiles ADD COLUMN theme_muted_color VARCHAR(7) DEFAULT '#f5f5f5';
ALTER TABLE professional_profiles ADD COLUMN theme_shadow_color VARCHAR(50) DEFAULT 'rgba(0, 0, 0, 0.1)';
ALTER TABLE professional_profiles ADD COLUMN theme_overlay_color VARCHAR(50) DEFAULT 'rgba(0, 0, 0, 0.5)';

-- Atualizar registros existentes com valores padrão baseados nas cores atuais
UPDATE professional_profiles 
SET 
    theme_border_color = CASE 
        WHEN theme_background_color = '#FFFFFF' THEN '#e5e5e5'
        ELSE '#333333'
    END,
    theme_muted_color = CASE 
        WHEN theme_background_color = '#FFFFFF' THEN '#f5f5f5'
        ELSE '#2c2c2c'
    END,
    theme_shadow_color = CASE 
        WHEN theme_background_color = '#FFFFFF' THEN 'rgba(0, 0, 0, 0.1)'
        ELSE 'rgba(0, 0, 0, 0.5)'
    END,
    theme_overlay_color = CASE 
        WHEN theme_background_color = '#FFFFFF' THEN 'rgba(0, 0, 0, 0.5)'
        ELSE 'rgba(0, 0, 0, 0.8)'
    END
WHERE theme_border_color IS NULL; 