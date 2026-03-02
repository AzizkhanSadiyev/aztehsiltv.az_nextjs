-- =============================================
-- Migration: 003_add_s3_support.sql
-- Description: Add S3 storage support for media
-- =============================================

ALTER TABLE media
ADD COLUMN s3_key VARCHAR(500) NULL AFTER path,
ADD COLUMN storage_type ENUM('local', 's3', 'cdn') NOT NULL DEFAULT 'local' AFTER s3_key,
ADD INDEX idx_storage_type (storage_type);

-- Record this migration
INSERT INTO migrations (migration) VALUES ('003_add_s3_support.sql');
