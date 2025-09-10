-- Tabela para rastrear atividade do usuário
CREATE TABLE IF NOT EXISTS user_activities (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'page_view', 'module_view', 'module_complete', 'session_start', 'session_end'
    page_path VARCHAR(500), -- caminho da página visitada
    module_id BIGINT, -- ID do módulo (se aplicável)
    module_title VARCHAR(255), -- título do módulo
    category VARCHAR(100), -- categoria do módulo
    time_spent BIGINT, -- tempo gasto em segundos
    session_id VARCHAR(255), -- ID da sessão
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    operating_system VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para rastrear sessões do usuário
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    total_time_spent BIGINT DEFAULT 0, -- tempo total em segundos
    pages_visited INTEGER DEFAULT 0,
    modules_viewed INTEGER DEFAULT 0,
    modules_completed INTEGER DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    operating_system VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para rastrear visualizações de módulos
CREATE TABLE IF NOT EXISTS module_views (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id BIGINT NOT NULL, -- referência ao módulo (pode ser de outra tabela)
    module_title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    time_spent BIGINT NOT NULL, -- tempo em segundos
    is_completed BOOLEAN DEFAULT false,
    completion_percentage INTEGER DEFAULT 0,
    session_id VARCHAR(255),
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para rastrear progresso do usuário por categoria
CREATE TABLE IF NOT EXISTS user_category_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    modules_viewed INTEGER DEFAULT 0,
    modules_completed INTEGER DEFAULT 0,
    total_time_spent BIGINT DEFAULT 0, -- em segundos
    last_activity TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_date ON user_activities(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_session ON user_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_module_views_user ON module_views(user_id);
CREATE INDEX IF NOT EXISTS idx_module_views_module ON module_views(module_id);
CREATE INDEX IF NOT EXISTS idx_user_category_progress_user ON user_category_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_category_progress_category ON user_category_progress(category);

-- Trigger para atualizar updated_at na tabela user_category_progress
CREATE OR REPLACE FUNCTION update_user_category_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_category_progress_updated_at
    BEFORE UPDATE ON user_category_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_user_category_progress_updated_at();
