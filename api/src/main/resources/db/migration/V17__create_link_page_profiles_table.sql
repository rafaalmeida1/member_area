-- Criação da tabela para configurações personalizadas da página de links
CREATE TABLE IF NOT EXISTS link_page_profiles (
    id BIGSERIAL PRIMARY KEY,
    professional_profile_id BIGINT NOT NULL,
    
    -- Configurações de exibição
    display_name VARCHAR(100),
    display_bio VARCHAR(500),
    display_title VARCHAR(150),
    display_image_url VARCHAR(500),
    
    -- Background personalizado
    background_image_url VARCHAR(500),
    background_position_x INTEGER DEFAULT 50,
    background_position_y INTEGER DEFAULT 50,
    
    -- Cores personalizadas da página de links
    page_primary_color VARCHAR(7),
    page_secondary_color VARCHAR(7),
    page_background_color VARCHAR(7),
    page_surface_color VARCHAR(7),
    page_text_primary_color VARCHAR(7),
    page_text_secondary_color VARCHAR(7),
    page_border_color VARCHAR(7),
    page_hover_color VARCHAR(7),
    
    -- Flag para usar cores do site principal
    use_site_colors BOOLEAN DEFAULT FALSE,
    
    -- Configurações de layout
    show_profile_image BOOLEAN DEFAULT TRUE,
    show_title BOOLEAN DEFAULT TRUE,
    show_bio BOOLEAN DEFAULT TRUE,
    show_branding BOOLEAN DEFAULT TRUE,
    custom_branding_text VARCHAR(100),
    
    -- SEO
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    
    -- Controle de acesso
    is_public BOOLEAN DEFAULT TRUE,
    password_protected BOOLEAN DEFAULT FALSE,
    access_password VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_link_page_profile_professional 
        FOREIGN KEY (professional_profile_id) 
        REFERENCES professional_profiles(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_professional_link_page 
        UNIQUE (professional_profile_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_link_page_profiles_professional_id ON link_page_profiles(professional_profile_id);
CREATE INDEX IF NOT EXISTS idx_link_page_profiles_public ON link_page_profiles(is_public) WHERE is_public = TRUE;

-- Comentários para documentação
COMMENT ON TABLE link_page_profiles IS 'Configurações personalizadas da página pública de links dos profissionais';
COMMENT ON COLUMN link_page_profiles.display_name IS 'Nome que aparecerá na página pública (pode ser diferente do nome do perfil)';
COMMENT ON COLUMN link_page_profiles.use_site_colors IS 'Se TRUE, usa as cores do perfil profissional; se FALSE, usa cores personalizadas';
COMMENT ON COLUMN link_page_profiles.password_protected IS 'Se TRUE, a página requer senha para acesso';
COMMENT ON COLUMN link_page_profiles.access_password IS 'Hash da senha para acesso à página (quando password_protected = TRUE)';
