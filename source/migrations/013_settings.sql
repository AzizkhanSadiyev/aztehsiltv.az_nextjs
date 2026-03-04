-- =============================================
-- Migration: 013_settings.sql
-- Description: Add settings table for site configuration
-- =============================================

CREATE TABLE IF NOT EXISTS settings (
    id CHAR(36) NOT NULL PRIMARY KEY,
    settings_key VARCHAR(100) NOT NULL,
    settings_value JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_settings_key (settings_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Record this migration
INSERT INTO migrations (migration) VALUES ('013_settings.sql');
