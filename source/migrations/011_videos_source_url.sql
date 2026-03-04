-- =============================================
-- Migration: 011_videos_source_url.sql
-- Description: Add source_url column for video links/uploads
-- =============================================

SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'videos'
    AND COLUMN_NAME = 'source_url'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE videos ADD COLUMN source_url VARCHAR(500) NULL AFTER cover_url',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Record this migration
INSERT INTO migrations (migration) VALUES ('011_videos_source_url.sql');
