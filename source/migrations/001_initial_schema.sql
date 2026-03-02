-- =============================================
-- Migration: 001_initial_schema.sql
-- Description: Core tables for aztehsiltv admin panel
-- =============================================

-- Users table (admin/auth)
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) NULL,
    role ENUM('admin', 'editor', 'author') NOT NULL DEFAULT 'author',
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    permissions JSON NULL COMMENT 'Array of permission strings',
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) PRIMARY KEY,
    name_az VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    slug_az VARCHAR(255) NOT NULL,
    slug_en VARCHAR(255) NOT NULL,
    slug_ru VARCHAR(255) NOT NULL,
    description_az TEXT NULL,
    description_en TEXT NULL,
    description_ru TEXT NULL,
    parent_id CHAR(36) NULL,
    icon VARCHAR(100) NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    `order` INT NOT NULL DEFAULT 0,
    positions JSON NULL COMMENT 'Array of position IDs (e.g., header/footer)',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_categories_slug_az (slug_az),
    UNIQUE KEY uk_categories_slug_en (slug_en),
    UNIQUE KEY uk_categories_slug_ru (slug_ru),
    INDEX idx_categories_parent_id (parent_id),
    INDEX idx_categories_is_active (is_active),
    INDEX idx_categories_order (`order`),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Media table
CREATE TABLE IF NOT EXISTS media (
    id CHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    type ENUM('image', 'video', 'document', 'other') NOT NULL DEFAULT 'image',
    size INT UNSIGNED NOT NULL,
    width INT UNSIGNED NULL,
    height INT UNSIGNED NULL,
    alt_az TEXT NULL,
    alt_en TEXT NULL,
    alt_ru TEXT NULL,
    title_az VARCHAR(255) NULL,
    title_en VARCHAR(255) NULL,
    title_ru VARCHAR(255) NULL,
    uploaded_by CHAR(36) NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSON NULL COMMENT 'Additional metadata: dimensions, format, folder, tags',
    INDEX idx_media_uploaded_by (uploaded_by),
    INDEX idx_media_type (type),
    INDEX idx_media_uploaded_at (uploaded_at),
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Broadcasts (shows / playlists)
CREATE TABLE IF NOT EXISTS broadcasts (
    id CHAR(36) PRIMARY KEY,
    title_az VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255) NOT NULL,
    slug_az VARCHAR(255) NOT NULL,
    slug_en VARCHAR(255) NOT NULL,
    slug_ru VARCHAR(255) NOT NULL,
    description_az TEXT NULL,
    description_en TEXT NULL,
    description_ru TEXT NULL,
    image_url VARCHAR(500) NOT NULL,
    status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_broadcasts_slug_az (slug_az),
    UNIQUE KEY uk_broadcasts_slug_en (slug_en),
    UNIQUE KEY uk_broadcasts_slug_ru (slug_ru),
    INDEX idx_broadcasts_status_order_updated (status, sort_order, updated_at),
    INDEX idx_broadcasts_sort_updated (sort_order, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id CHAR(36) PRIMARY KEY,
    title_az VARCHAR(500) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    title_ru VARCHAR(500) NOT NULL,
    slug_az VARCHAR(500) NOT NULL,
    slug_en VARCHAR(500) NOT NULL,
    slug_ru VARCHAR(500) NOT NULL,
    description_az TEXT NULL,
    description_en TEXT NULL,
    description_ru TEXT NULL,
    cover_url VARCHAR(500) NULL,
    category_id CHAR(36) NULL,
    broadcast_id CHAR(36) NULL,
    type ENUM('video', 'list') NOT NULL DEFAULT 'video',
    duration VARCHAR(20) NULL,
    views INT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    is_manshet BOOLEAN NOT NULL DEFAULT FALSE,
    is_short BOOLEAN NOT NULL DEFAULT FALSE,
    is_sidebar BOOLEAN NOT NULL DEFAULT FALSE,
    is_top_video BOOLEAN NOT NULL DEFAULT FALSE,
    published_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    metadata JSON NULL,
    UNIQUE KEY uk_videos_slug_az (slug_az),
    UNIQUE KEY uk_videos_slug_en (slug_en),
    UNIQUE KEY uk_videos_slug_ru (slug_ru),
    INDEX idx_videos_status (status),
    INDEX idx_videos_category (category_id),
    INDEX idx_videos_broadcast (broadcast_id),
    INDEX idx_videos_flags (is_manshet, is_short, is_sidebar, is_top_video),
    INDEX idx_videos_published_at (published_at),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(500) NOT NULL,
    website_url VARCHAR(500) NULL,
    status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_partners_status_order_updated (status, sort_order, updated_at),
    INDEX idx_partners_sort_updated (sort_order, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration VARCHAR(255) NOT NULL UNIQUE,
    executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_migration (migration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Record this migration
INSERT INTO migrations (migration) VALUES ('001_initial_schema.sql');
