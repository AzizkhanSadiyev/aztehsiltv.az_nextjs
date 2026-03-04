-- =============================================
-- Migration: 012_video_categories.sql
-- Description: Add many-to-many relationship between videos and categories
-- =============================================

CREATE TABLE IF NOT EXISTS video_categories (
    video_id CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (video_id, category_id),
    INDEX idx_video_categories_video (video_id),
    INDEX idx_video_categories_category (category_id),
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backfill existing single category selections
INSERT IGNORE INTO video_categories (video_id, category_id, is_primary)
SELECT id, category_id, TRUE
FROM videos
WHERE category_id IS NOT NULL;

-- Record this migration
INSERT INTO migrations (migration) VALUES ('012_video_categories.sql');
