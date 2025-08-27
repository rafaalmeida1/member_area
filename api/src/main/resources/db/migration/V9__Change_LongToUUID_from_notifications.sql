-- Troca de Long para UUID na tabela notifications
ALTER TABLE notifications ALTER COLUMN module_id TYPE UUID USING module_id::uuid;