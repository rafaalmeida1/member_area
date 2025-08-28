-- Adiciona campos para cores personalizadas do tema
ALTER TABLE professional_profiles
    ADD COLUMN IF NOT EXISTS theme_primary_color VARCHAR(7) DEFAULT '#DBCFCB',
    ADD COLUMN IF NOT EXISTS theme_secondary_color VARCHAR(7) DEFAULT '#D8C4A4',
    ADD COLUMN IF NOT EXISTS theme_accent_color VARCHAR(7) DEFAULT '#A67B5B',
    ADD COLUMN IF NOT EXISTS theme_background_color VARCHAR(7) DEFAULT '#FFFFFF',
    ADD COLUMN IF NOT EXISTS theme_surface_color VARCHAR(7) DEFAULT '#FAFAFA',
    ADD COLUMN IF NOT EXISTS theme_text_color VARCHAR(7) DEFAULT '#2C2C2C',
    ADD COLUMN IF NOT EXISTS theme_text_secondary_color VARCHAR(7) DEFAULT '#666666';

-- Garantir que as cores sejam válidas (formato hex)
UPDATE professional_profiles
SET theme_primary_color = '#DBCFCB'
WHERE theme_primary_color IS NULL OR theme_primary_color NOT SIMILAR TO '#[0-9A-Fa-f]{6}';

UPDATE professional_profiles
SET theme_secondary_color = '#D8C4A4'
WHERE theme_secondary_color IS NULL OR theme_secondary_color NOT SIMILAR TO '#[0-9A-Fa-f]{6}';

UPDATE professional_profiles
SET theme_accent_color = '#A67B5B'
WHERE theme_accent_color IS NULL OR theme_accent_color NOT SIMILAR TO '#[0-9A-Fa-f]{6}';

UPDATE professional_profiles
SET theme_background_color = '#FFFFFF'
WHERE theme_background_color IS NULL OR theme_background_color NOT SIMILAR TO '#[0-9A-Fa-f]{6}';

UPDATE professional_profiles
SET theme_surface_color = '#FAFAFA'
WHERE theme_surface_color IS NULL OR theme_surface_color NOT SIMILAR TO '#[0-9A-Fa-f]{6}';

UPDATE professional_profiles
SET theme_text_color = '#2C2C2C'
WHERE theme_text_color IS NULL OR theme_text_color NOT SIMILAR TO '#[0-9A-Fa-f]{6}';

UPDATE professional_profiles
SET theme_text_secondary_color = '#666666'
WHERE theme_text_secondary_color IS NULL OR theme_text_secondary_color NOT SIMILAR TO '#[0-9A-Fa-f]{6}'; 