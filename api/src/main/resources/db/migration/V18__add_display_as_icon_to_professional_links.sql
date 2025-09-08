-- Adicionar coluna display_as_icon à tabela professional_links
ALTER TABLE professional_links 
ADD COLUMN IF NOT EXISTS display_as_icon BOOLEAN NOT NULL DEFAULT false;

-- Criar índice para melhor performance em consultas
CREATE INDEX IF NOT EXISTS idx_professional_links_display_as_icon ON professional_links(display_as_icon);
