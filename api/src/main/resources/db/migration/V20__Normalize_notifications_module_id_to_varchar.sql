-- V20: Normalizar tipo de notifications.module_id para VARCHAR(255)
-- Contexto: Hibernate espera VARCHAR(255), porém alguns ambientes ficaram com UUID (V10)

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'notifications'
          AND column_name = 'module_id'
          AND udt_name = 'uuid'
    ) THEN
        ALTER TABLE notifications
            ALTER COLUMN module_id TYPE VARCHAR(255)
            USING module_id::text;
    END IF;
END $$;


