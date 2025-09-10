-- Adicionar colunas created_at e updated_at na tabela user_sessions se não existirem
DO $$ 
BEGIN
    -- Adicionar created_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_sessions' AND column_name = 'created_at') THEN
        ALTER TABLE user_sessions ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Adicionar updated_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_sessions' AND column_name = 'updated_at') THEN
        ALTER TABLE user_sessions ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

