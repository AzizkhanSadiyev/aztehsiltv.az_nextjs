-- =============================================
-- Migration: 004_categories_icon.sql
-- Description: Ensure categories.icon exists for all categories (including subcategories)
-- =============================================

SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'icon'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE categories ADD COLUMN icon VARCHAR(255) NULL AFTER parent_id',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Record this migration
INSERT INTO migrations (migration) VALUES ('004_categories_icon.sql');
