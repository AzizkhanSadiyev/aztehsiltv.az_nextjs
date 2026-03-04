-- =============================================
-- Migration: 010_media_table.sql
-- Description: Ensure media table exists for uploaded files
-- =============================================

CREATE TABLE IF NOT EXISTS media (
    id CHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    path VARCHAR(500) NOT NULL,
    s3_key VARCHAR(500) NULL,
    storage_type ENUM('local', 's3', 'cdn') NOT NULL DEFAULT 'local',
    mime_type VARCHAR(100) NOT NULL,
    type ENUM('image', 'video', 'document', 'other') NOT NULL DEFAULT 'image',
    size INT UNSIGNED NOT NULL,
    width INT UNSIGNED NULL,
    height INT UNSIGNED NULL,
    alt JSON NULL,
    title JSON NULL,
    uploaded_by CHAR(36) NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSON NULL COMMENT 'Additional metadata: entity, folder, field, tags',
    INDEX idx_media_uploaded_by (uploaded_by),
    INDEX idx_media_type (type),
    INDEX idx_media_uploaded_at (uploaded_at),
    INDEX idx_storage_type (storage_type),
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Record this migration
INSERT INTO migrations (migration) VALUES ('010_media_table.sql');
