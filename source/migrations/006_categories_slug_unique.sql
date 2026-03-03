-- =============================================
-- Migration: 006_categories_slug_unique.sql
-- Description: Ensure categories.slug is VARCHAR and unique
-- =============================================

SET @slug_is_json := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'slug'
    AND DATA_TYPE = 'json'
);

SET @has_slug_new := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'slug_new'
);

SET @sql := IF(
  @slug_is_json > 0 AND @has_slug_new = 0,
  'ALTER TABLE categories ADD COLUMN slug_new VARCHAR(255) NULL AFTER name',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @slug_is_json > 0,
  'UPDATE categories SET slug_new = COALESCE(
      JSON_UNQUOTE(JSON_EXTRACT(slug, ''$.az'')),
      JSON_UNQUOTE(JSON_EXTRACT(slug, ''$.en'')),
      JSON_UNQUOTE(JSON_EXTRACT(slug, ''$.ru'')),
      JSON_UNQUOTE(JSON_EXTRACT(slug, ''$.tr'')),
      JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT(slug, ''$.*''), ''$[0]'')),
      id
    )',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @slug_is_json > 0,
  'ALTER TABLE categories DROP COLUMN slug',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @slug_is_json > 0,
  'ALTER TABLE categories CHANGE COLUMN slug_new slug VARCHAR(255) NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @slug_is_json = 0,
  'ALTER TABLE categories MODIFY slug VARCHAR(255) NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_unique := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categories'
    AND INDEX_NAME = 'uk_categories_slug'
);

SET @sql := IF(
  @has_unique = 0,
  'CREATE UNIQUE INDEX uk_categories_slug ON categories (slug)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Record this migration
INSERT INTO migrations (migration) VALUES ('006_categories_slug_unique.sql');
