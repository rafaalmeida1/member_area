-- Tabela de links profissionais
CREATE TABLE IF NOT EXISTS professional_links (
    id BIGSERIAL PRIMARY KEY,
    professional_profile_id BIGINT NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    link_type VARCHAR(50) NOT NULL,
    icon VARCHAR(255),
    whatsapp_message TEXT,
    display_order INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    click_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de visualizações de página
CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    professional_profile_id BIGINT NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(50),
    operating_system VARCHAR(50),
    session_duration BIGINT,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cliques em links
CREATE TABLE IF NOT EXISTS link_clicks (
    id BIGSERIAL PRIMARY KEY,
    professional_link_id BIGINT NOT NULL REFERENCES professional_links(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(50),
    operating_system VARCHAR(50),
    clicked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_professional_links_profile_order ON professional_links(professional_profile_id, display_order);
CREATE INDEX IF NOT EXISTS idx_professional_links_active ON professional_links(professional_profile_id, is_active);
CREATE INDEX IF NOT EXISTS idx_page_views_profile_date ON page_views(professional_profile_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_ip_date ON page_views(ip_address, viewed_at);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_date ON link_clicks(professional_link_id, clicked_at);
CREATE INDEX IF NOT EXISTS idx_link_clicks_ip_date ON link_clicks(ip_address, clicked_at);
CREATE INDEX IF NOT EXISTS idx_link_clicks_user ON link_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user ON page_views(user_id);
