-- Adicionar campo order_index na tabela modules
ALTER TABLE modules ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;

-- Atualizar módulos existentes com ordem baseada na data de criação
UPDATE modules SET order_index = EXTRACT(EPOCH FROM (created_at - '1970-01-01'::timestamp))::integer;

-- Criar índice para melhorar performance das consultas ordenadas
CREATE INDEX idx_modules_order_index ON modules(order_index);
CREATE INDEX idx_modules_created_by_order ON modules(created_by, order_index); 