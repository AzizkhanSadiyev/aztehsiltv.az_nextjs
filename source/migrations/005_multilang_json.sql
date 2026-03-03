-- =============================================
-- Migration: 005_multilang_json.sql
-- Description: Convert localized fields to JSON for unlimited languages
-- =============================================

-- Categories
SET @has_categories_old := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'name_az'
);

SET @sql := IF(
  @has_categories_old > 0,
  'ALTER TABLE categories ADD COLUMN name JSON NULL AFTER id, ADD COLUMN slug JSON NULL AFTER name, ADD COLUMN description JSON NULL AFTER slug',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_categories_old > 0,
  'UPDATE categories SET name = JSON_OBJECT(''az'', name_az, ''en'', name_en, ''ru'', name_ru), slug = JSON_OBJECT(''az'', slug_az, ''en'', slug_en, ''ru'', slug_ru), description = CASE WHEN description_az IS NULL AND description_en IS NULL AND description_ru IS NULL THEN NULL ELSE JSON_OBJECT(''az'', description_az, ''en'', description_en, ''ru'', description_ru) END',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_categories_old > 0,
  'ALTER TABLE categories MODIFY name JSON NOT NULL, MODIFY slug JSON NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_categories_old > 0,
  'ALTER TABLE categories DROP INDEX uk_categories_slug_az, DROP INDEX uk_categories_slug_en, DROP INDEX uk_categories_slug_ru',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_categories_old > 0,
  'ALTER TABLE categories DROP COLUMN name_az, DROP COLUMN name_en, DROP COLUMN name_ru, DROP COLUMN slug_az, DROP COLUMN slug_en, DROP COLUMN slug_ru, DROP COLUMN description_az, DROP COLUMN description_en, DROP COLUMN description_ru',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Media
SET @has_media_old := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'media'
    AND COLUMN_NAME = 'alt_az'
);

SET @sql := IF(
  @has_media_old > 0,
  'ALTER TABLE media ADD COLUMN alt JSON NULL AFTER height, ADD COLUMN title JSON NULL AFTER alt',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_media_old > 0,
  'UPDATE media SET alt = CASE WHEN alt_az IS NULL AND alt_en IS NULL AND alt_ru IS NULL THEN NULL ELSE JSON_OBJECT(''az'', alt_az, ''en'', alt_en, ''ru'', alt_ru) END, title = CASE WHEN title_az IS NULL AND title_en IS NULL AND title_ru IS NULL THEN NULL ELSE JSON_OBJECT(''az'', title_az, ''en'', title_en, ''ru'', title_ru) END',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_media_old > 0,
  'ALTER TABLE media DROP COLUMN alt_az, DROP COLUMN alt_en, DROP COLUMN alt_ru, DROP COLUMN title_az, DROP COLUMN title_en, DROP COLUMN title_ru',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Broadcasts
SET @has_broadcasts_old := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'broadcasts'
    AND COLUMN_NAME = 'title_az'
);

SET @sql := IF(
  @has_broadcasts_old > 0,
  'ALTER TABLE broadcasts ADD COLUMN title JSON NULL AFTER id, ADD COLUMN slug JSON NULL AFTER title, ADD COLUMN description JSON NULL AFTER slug',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_broadcasts_old > 0,
  'UPDATE broadcasts SET title = JSON_OBJECT(''az'', title_az, ''en'', title_en, ''ru'', title_ru), slug = JSON_OBJECT(''az'', slug_az, ''en'', slug_en, ''ru'', slug_ru), description = CASE WHEN description_az IS NULL AND description_en IS NULL AND description_ru IS NULL THEN NULL ELSE JSON_OBJECT(''az'', description_az, ''en'', description_en, ''ru'', description_ru) END',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_broadcasts_old > 0,
  'ALTER TABLE broadcasts MODIFY title JSON NOT NULL, MODIFY slug JSON NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_broadcasts_old > 0,
  'ALTER TABLE broadcasts DROP INDEX uk_broadcasts_slug_az, DROP INDEX uk_broadcasts_slug_en, DROP INDEX uk_broadcasts_slug_ru',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_broadcasts_old > 0,
  'ALTER TABLE broadcasts DROP COLUMN title_az, DROP COLUMN title_en, DROP COLUMN title_ru, DROP COLUMN slug_az, DROP COLUMN slug_en, DROP COLUMN slug_ru, DROP COLUMN description_az, DROP COLUMN description_en, DROP COLUMN description_ru',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Videos
SET @has_videos_old := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'videos'
    AND COLUMN_NAME = 'title_az'
);

SET @sql := IF(
  @has_videos_old > 0,
  'ALTER TABLE videos ADD COLUMN title JSON NULL AFTER id, ADD COLUMN slug JSON NULL AFTER title, ADD COLUMN description JSON NULL AFTER slug',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_videos_old > 0,
  'UPDATE videos SET title = JSON_OBJECT(''az'', title_az, ''en'', title_en, ''ru'', title_ru), slug = JSON_OBJECT(''az'', slug_az, ''en'', slug_en, ''ru'', slug_ru), description = CASE WHEN description_az IS NULL AND description_en IS NULL AND description_ru IS NULL THEN NULL ELSE JSON_OBJECT(''az'', description_az, ''en'', description_en, ''ru'', description_ru) END',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_videos_old > 0,
  'ALTER TABLE videos MODIFY title JSON NOT NULL, MODIFY slug JSON NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_videos_old > 0,
  'ALTER TABLE videos DROP INDEX uk_videos_slug_az, DROP INDEX uk_videos_slug_en, DROP INDEX uk_videos_slug_ru',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @has_videos_old > 0,
  'ALTER TABLE videos DROP COLUMN title_az, DROP COLUMN title_en, DROP COLUMN title_ru, DROP COLUMN slug_az, DROP COLUMN slug_en, DROP COLUMN slug_ru, DROP COLUMN description_az, DROP COLUMN description_en, DROP COLUMN description_ru',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Record this migration
INSERT INTO migrations (migration) VALUES ('005_multilang_json.sql');
