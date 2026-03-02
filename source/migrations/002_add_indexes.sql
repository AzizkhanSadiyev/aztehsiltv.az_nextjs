-- =============================================
-- Migration: 002_add_indexes.sql
-- Description: Add additional performance indexes
-- =============================================

-- Videos: frequently queried by status + published date
CREATE INDEX idx_videos_status_published ON videos(status, published_at DESC);

-- Videos: frequently queried by category + status
CREATE INDEX idx_videos_category_status ON videos(category_id, status);

-- Videos: frequently queried by broadcast + status
CREATE INDEX idx_videos_broadcast_status ON videos(broadcast_id, status);

-- Categories: frequently queried by parent + active status
CREATE INDEX idx_categories_parent_active_order ON categories(parent_id, is_active, `order`);

-- Media: frequently queried by uploader + upload date
CREATE INDEX idx_media_uploader_date ON media(uploaded_by, uploaded_at DESC);

-- Record this migration
INSERT INTO migrations (migration) VALUES ('002_add_indexes.sql');
