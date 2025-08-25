-- Inicialização do banco de dados
-- Este script é executado quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Configurações de encoding e collation
ALTER DATABASE nutri_thata_db SET timezone TO 'UTC';