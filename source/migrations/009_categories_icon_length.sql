-- =============================================
-- Migration: 009_categories_icon_length.sql
-- Description: Increase categories.icon length for longer upload paths
-- =============================================

SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'icon'
);

SET @col_len := (
  SELECT CHARACTER_MAXIMUM_LENGTH
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'icon'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE categories ADD COLUMN icon VARCHAR(500) NULL AFTER parent_id',
  IF(@col_len < 500, 'ALTER TABLE categories MODIFY icon VARCHAR(500) NULL', 'SELECT 1')
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Record this migration
INSERT INTO migrations (migration) VALUES ('009_categories_icon_length.sql');
