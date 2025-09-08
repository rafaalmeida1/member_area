-- V1__Create_initial_tables.sql
-- Criação das tabelas principais do sistema

-- ========== EXTENSÕES ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== USERS TABLE ==========
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    birth_date DATE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('PATIENT', 'PROFESSIONAL', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ========== PROFESSIONAL PROFILES TABLE ==========
CREATE TABLE professional_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    title VARCHAR(255),
    bio TEXT,
    image TEXT,
    background_image TEXT,
    background_image_position VARCHAR(20) DEFAULT 'CENTER',

    -- Core theme colors (final schema)
    theme_primary_color VARCHAR(7) DEFAULT '#DBCFCB',
    theme_secondary_color VARCHAR(7) DEFAULT '#D8C4A4',
    theme_background_color VARCHAR(7) DEFAULT '#FFFFFF',
    theme_surface_color VARCHAR(7) DEFAULT '#FAFAFA',
    theme_text_primary_color VARCHAR(7) DEFAULT '#2C2C2C',
    theme_text_secondary_color VARCHAR(7) DEFAULT '#666666',
    theme_border_color VARCHAR(7) DEFAULT '#E5E5E5',
    theme_hover_color VARCHAR(7) DEFAULT '#F5F5F5',
    theme_disabled_color VARCHAR(7) DEFAULT '#CCCCCC',

    -- Input-specific colors
    input_background_color VARCHAR(7) DEFAULT '#FFFFFF',
    input_border_color VARCHAR(7) DEFAULT '#D1D5DB',
    input_focus_color VARCHAR(7) DEFAULT '#A67B5B',
    input_text_color VARCHAR(7) DEFAULT '#2C2C2C',
    input_placeholder_color VARCHAR(7) DEFAULT '#9CA3AF',

    -- Button-specific colors (final schema)
    button_primary_bg_color VARCHAR(7) DEFAULT '#A67B5B',
    button_primary_hover_color VARCHAR(7) DEFAULT '#8B5A3C',
    button_primary_text_color VARCHAR(7) DEFAULT '#FFFFFF',
    button_secondary_bg_color VARCHAR(7) DEFAULT '#F3F4F6',
    button_secondary_hover_color VARCHAR(7) DEFAULT '#E5E7EB',
    button_secondary_text_color VARCHAR(7) DEFAULT '#374151',
    button_disabled_color VARCHAR(7) DEFAULT '#F9FAFB',
    button_disabled_text_color VARCHAR(7) DEFAULT '#9CA3AF',

    -- Status colors (final schema)
    success_color VARCHAR(7) DEFAULT '#10B981',
    warning_color VARCHAR(7) DEFAULT '#F59E0B',
    error_color VARCHAR(7) DEFAULT '#EF4444',
    info_color VARCHAR(7) DEFAULT '#3B82F6',

    -- Legacy compatibility columns used by older code paths
    button_primary_color VARCHAR(7) DEFAULT '#A67B5B',
    button_secondary_color VARCHAR(7) DEFAULT '#F3F4F6',
    color_success VARCHAR(7) DEFAULT '#10B981',
    color_warning VARCHAR(7) DEFAULT '#F59E0B',
    color_error VARCHAR(7) DEFAULT '#EF4444',
    color_info VARCHAR(7) DEFAULT '#3B82F6',
    color_overlay VARCHAR(7) DEFAULT '#000000',
    color_shadow VARCHAR(7) DEFAULT '#000000',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ========== PROFESSIONAL SPECIALTIES TABLE ==========
CREATE TABLE professional_specialties (
    professional_id BIGINT NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    specialty VARCHAR(255) NOT NULL,
    PRIMARY KEY (professional_id, specialty)
);

-- ========== MODULES TABLE ==========
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    cover_image TEXT,
    category VARCHAR(100) NOT NULL,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ========== CONTENT BLOCKS TABLE ==========
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('TEXT', 'VIDEO', 'AUDIO', 'PDF')),
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (module_id, order_index)
);

-- ========== MEDIA ASSETS TABLE ==========
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT')),
    storage VARCHAR(20) NOT NULL CHECK (storage IN ('LOCAL', 'EXTERNAL_URL')),
    file_path TEXT,
    public_url TEXT,
    external_url TEXT,
    original_filename VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========== INVITES TABLE ==========
CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'PATIENT' CHECK (role IN ('PATIENT', 'PROFESSIONAL', 'ADMIN')),
    prefill JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========== INDEXES ==========
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Professional Profiles
CREATE INDEX idx_professional_profiles_user_id ON professional_profiles(user_id);

-- Modules
CREATE INDEX idx_modules_category ON modules(category);
CREATE INDEX idx_modules_created_by ON modules(created_by);
CREATE INDEX idx_modules_created_at ON modules(created_at);
CREATE INDEX idx_modules_title ON modules(title);

-- Content Blocks
CREATE INDEX idx_content_blocks_module_id ON content_blocks(module_id);
CREATE INDEX idx_content_blocks_type ON content_blocks(type);
CREATE INDEX idx_content_blocks_order ON content_blocks(module_id, order_index);

-- Media Assets
CREATE INDEX idx_media_assets_owner ON media_assets(owner_user_id);
CREATE INDEX idx_media_assets_type ON media_assets(type);
CREATE INDEX idx_media_assets_storage ON media_assets(storage);
CREATE INDEX idx_media_assets_created_at ON media_assets(created_at);

-- Invites
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_status ON invites(status);
CREATE INDEX idx_invites_expires_at ON invites(expires_at);
CREATE INDEX idx_invites_created_by ON invites(created_by);
CREATE INDEX idx_invites_created_at ON invites(created_at);

-- Full-text search for modules
CREATE INDEX idx_modules_search ON modules USING GIN (
    to_tsvector('portuguese', title || ' ' || description)
);