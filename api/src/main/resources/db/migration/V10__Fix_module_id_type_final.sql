-- Migration V10: Fix module_id type in notifications table
-- This migration ensures the module_id column is properly typed as UUID
ALTER TABLE notifications ALTER COLUMN module_id TYPE UUID USING module_id::UUID; 