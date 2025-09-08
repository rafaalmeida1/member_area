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