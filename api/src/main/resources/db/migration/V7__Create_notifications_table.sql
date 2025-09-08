-- Migration V7: Create notifications table (esquema final consolidado)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    module_id VARCHAR(255),
    module_title VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Garantir colunas quando a tabela já existir
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS module_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS module_title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Converter module_id UUID -> VARCHAR(255) apenas se necessário
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'module_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE notifications ALTER COLUMN module_id TYPE VARCHAR(255) USING module_id::text;
    END IF;
END $$;

-- Migrar coluna legada 'read' -> 'is_read' e remover a antiga
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'read'
    ) THEN
        -- Garantir coluna is_read existe
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN;
        -- Copiar valores
        UPDATE notifications SET is_read = COALESCE(is_read, read);
        -- Definir restrições finais
        ALTER TABLE notifications ALTER COLUMN is_read SET DEFAULT FALSE;
        ALTER TABLE notifications ALTER COLUMN is_read SET NOT NULL;
        -- Remover coluna antiga
        ALTER TABLE notifications DROP COLUMN IF EXISTS read;
    END IF;
END $$;

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- Constraint de tipos de notificação
DO $$
BEGIN
    ALTER TABLE notifications ADD CONSTRAINT chk_notification_type 
    CHECK (type IN (
        'MODULE_NEW', 
        'MODULE_UPDATED', 
        'MODULE_COMPLETED', 
        'PATIENT_REGISTERED', 
        'PATIENT_ACTIVITY', 
        'INVITE_ACCEPTED', 
        'APPOINTMENT_REMINDER', 
        'SYSTEM', 
        'PROFESSIONAL_MESSAGE'
    ));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;