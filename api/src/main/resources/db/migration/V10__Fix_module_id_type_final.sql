-- Migration V10: Fix module_id type in notifications table
-- This migration ensures the module_id column is properly typed as UUID
DO $$
BEGIN
    ALTER TABLE notifications ALTER COLUMN module_id TYPE UUID USING module_id::UUID; 
EXCEPTION
    WHEN others THEN
        -- Se já for UUID ou conversão não for necessária, ignore
        NULL;
END $$;