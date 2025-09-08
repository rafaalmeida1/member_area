-- ========== SISTEMA DE VISIBILIDADE DE CONTEÚDO ==========

-- Adicionar campo de visibilidade na tabela modules
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) NOT NULL DEFAULT 'GENERAL';

-- Criar tabela de relacionamento para pacientes específicos
CREATE TABLE IF NOT EXISTS module_patient_access (
    module_id UUID NOT NULL,
    patient_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (module_id, patient_id),
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Atualizar usuário admin para ser professional 
UPDATE users SET role = 'PROFESSIONAL' WHERE role = 'ADMIN';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_modules_visibility ON modules(visibility);
CREATE INDEX IF NOT EXISTS idx_module_patient_access_patient ON module_patient_access(patient_id);
CREATE INDEX IF NOT EXISTS idx_module_patient_access_module ON module_patient_access(module_id);

-- Comentários para documentação
COMMENT ON COLUMN modules.visibility IS 'GENERAL: visível para todos pacientes, SPECIFIC: apenas para pacientes selecionados';
COMMENT ON TABLE module_patient_access IS 'Relacionamento N:N entre módulos e pacientes para acesso específico';