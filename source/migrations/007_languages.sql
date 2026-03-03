-- =============================================
-- Migration: 007_languages.sql
-- Description: Add languages table for admin-managed locales
-- =============================================

CREATE TABLE IF NOT EXISTS languages (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_languages_active (is_active),
    INDEX idx_languages_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO languages (id, code, name, native_name, is_active, sort_order, created_at, updated_at) VALUES
    (UUID(), 'az', 'Azerbaijani', 'Azerbaijani', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (UUID(), 'en', 'English', 'English', TRUE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (UUID(), 'ru', 'Russian', 'Russian', TRUE, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Record this migration
INSERT INTO migrations (migration) VALUES ('007_languages.sql');
