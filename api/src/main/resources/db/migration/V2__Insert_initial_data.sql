-- V2__Insert_initial_data.sql
-- Inserção de dados iniciais para desenvolvimento e testes

-- ========== USUÁRIO ADMIN RAFAEL ==========
-- Senha: 123456rR (hash BCrypt)
INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
VALUES (
    'Rafael',
    'rafaprof312@gmail.com',
    '$2b$12$2GP6keDOzqrvTBOeEnqPTOvCjUui6A1NFDDdctklD9aKVXzX7EuNC',
    'PROFESSIONAL',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ========== USUÁRIO PROFISSIONAL THAISA ==========
-- Senha: Quemnaosecomunic.1 (hash BCrypt)
INSERT INTO users (name, email, password, phone, role, is_active, created_at, updated_at)if(request.)
VALUES (
    'Thaisa Melo',
    'thaisanmelo@gmail.com',
    '$2b$12$YiSSzeLKuxzFqOvPVbZ1lOSKGjgzt2UuQwszzUMRQzh5NjbLlVxDu',
    '(11) 99999-1111',
    'PROFESSIONAL',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ========== PERFIL PROFISSIONAL RAFAEL ==========
INSERT INTO professional_profiles (user_id, name, title, bio, image, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE email = 'rafaprof312@gmail.com'),
    'Rafael',
    'Administrador do Sistema',
    'Administrador e desenvolvedor da plataforma Nutri Thata.',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ========== PERFIL PROFISSIONAL THAISA ==========
INSERT INTO professional_profiles (user_id, name, title, bio, image, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE email = 'thaisanmelo@gmail.com'),
    'Thaisa Melo',
    'Nutricionista Clínica',
    'Especialista em nutrição funcional e emagrecimento saudável. Mais de 5 anos de experiência ajudando pessoas a transformarem seus hábitos alimentares.',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ========== ESPECIALIDADES DA THAISA ==========
INSERT INTO professional_specialties (professional_id, specialty)
VALUES 
    ((SELECT id FROM professional_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'thaisanmelo@gmail.com')), 'Nutrição Funcional'),
    ((SELECT id FROM professional_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'thaisanmelo@gmail.com')), 'Emagrecimento'),
    ((SELECT id FROM professional_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'thaisanmelo@gmail.com')), 'Nutrição Esportiva'),
    ((SELECT id FROM professional_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'thaisanmelo@gmail.com')), 'Educação Nutricional');

-- Fim dos dados iniciais
