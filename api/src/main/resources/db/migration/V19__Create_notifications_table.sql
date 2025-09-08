-- Migration V19: Create notifications table
-- Created: 2024-12-19

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

-- Compat: se a tabela já existir com coluna "read" (da V7), garantir coluna "is_read"
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'notifications' 
          AND column_name = 'read'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'notifications' 
          AND column_name = 'is_read'
    ) THEN
        ALTER TABLE notifications ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE;
        UPDATE notifications SET is_read = read;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- Add notification types enum constraint
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
