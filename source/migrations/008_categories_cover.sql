-- =============================================
-- Migration: 008_categories_cover.sql
-- Description: Add cover_url to categories for cover images
-- =============================================

SET @has_cover := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'cover_url'
);

SET @sql := IF(
  @has_cover = 0,
  'ALTER TABLE categories ADD COLUMN cover_url VARCHAR(500) NULL AFTER icon',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Record this migration
INSERT INTO migrations (migration) VALUES ('008_categories_cover.sql');
