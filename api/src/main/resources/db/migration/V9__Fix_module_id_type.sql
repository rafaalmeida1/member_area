-- Migration V9: Fix module_id type in notifications table
-- Drop existing column and recreate with correct type
ALTER TABLE notifications DROP COLUMN IF EXISTS module_id;
ALTER TABLE notifications ADD COLUMN module_id VARCHAR(36); 