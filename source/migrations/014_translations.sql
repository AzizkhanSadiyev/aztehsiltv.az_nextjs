-- =============================================
-- Migration: 014_translations.sql
-- Description: Translation keys table for admin-managed UI copy
-- =============================================

CREATE TABLE IF NOT EXISTS translations (
    id CHAR(36) PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL,
    `value` JSON NOT NULL,
    description VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_translations_key (`key`),
    INDEX idx_translations_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Record this migration
INSERT INTO migrations (migration) VALUES ('014_translations.sql');
