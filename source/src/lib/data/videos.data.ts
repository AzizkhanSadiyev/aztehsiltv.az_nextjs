/**
 * Videos Data Access Layer (MySQL)
 */

import { v4 as uuidv4 } from "uuid";
import { query, queryOne, insert, update as updateQuery } from "@/lib/db";
import { defaultLocale, locales } from "@/i18n/config";
import type {
  Video,
  VideoCreateInput,
  VideoUpdateInput,
  VideoStatus,
} from "@/types/video.types";
import {
  buildSlugMap,
  jsonPathForLocale,
  mergeLocalized,
  normalizeLocalized,
  normalizeLocalizedNullable,
  toJsonOrNull,
} from "@/lib/localization";

type VideoRow = {
  id: string;
  title: any;
  slug: any;
  description: any;
  cover_url: string | null;
  source_url: string | null;
  category_id: string | null;
  broadcast_id: string | null;
  type: "video" | "list";
  duration: string | null;
  views: number;
  status: "draft" | "published";
  is_manshet: number | boolean;
  is_short: number | boolean;
  is_sidebar: number | boolean;
  is_top_video: number | boolean;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
  metadata: any;
};

export type VideoFilters = {
  status?: VideoStatus;
  categoryId?: string;
  broadcastId?: string;
  search?: string;
};

const parseMetadata = (value: any) => {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
};

const normalizeTags = (value?: string[] | null): string[] => {
  if (!Array.isArray(value)) return [];
  const cleaned = value
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter((tag) => tag.length > 0);
  return Array.from(new Set(cleaned));
};

const normalizeCategoryIds = (value?: (string | null | undefined)[] | null) => {
  if (!Array.isArray(value)) return [];
  const cleaned = value
    .map((id) => (typeof id === "string" ? id.trim() : ""))
    .filter((id) => id.length > 0);
  return Array.from(new Set(cleaned));
};

const mergeTagsIntoMetadata = (
  metadata: Record<string, any> | null | undefined,
  tags?: string[] | null,
) => {
  if (tags === undefined) return metadata ?? null;
  const cleaned = normalizeTags(tags);
  const next = { ...(metadata ?? {}) } as Record<string, any>;
  if (cleaned.length > 0) {
    next.tags = cleaned;
  } else if ("tags" in next) {
    delete next.tags;
  }
  return Object.keys(next).length > 0 ? next : null;
};

const generateSlug = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

async function getVideoCategoryMap(
  videoIds: string[],
): Promise<Map<string, string[]>> {
  if (!videoIds.length) return new Map();
  const placeholders = videoIds.map(() => "?").join(", ");
  const rows = await query<{
    video_id: string;
    category_id: string;
    is_primary: number | boolean;
  }>(
    `SELECT video_id, category_id, is_primary
     FROM video_categories
     WHERE video_id IN (${placeholders})
     ORDER BY is_primary DESC, created_at ASC`,
    videoIds,
  );
  const map = new Map<string, string[]>();
  rows.forEach((row) => {
    const list = map.get(row.video_id) ?? [];
    if (!list.includes(row.category_id)) {
      list.push(row.category_id);
    }
    map.set(row.video_id, list);
  });
  return map;
}

async function syncVideoCategories(
  videoId: string,
  categoryIds: string[],
  primaryId?: string | null,
) {
  const normalized = normalizeCategoryIds(categoryIds);
  let primary = primaryId ?? null;
  if (primary && !normalized.includes(primary)) {
    normalized.unshift(primary);
  }
  primary = primary && normalized.includes(primary) ? primary : normalized[0] ?? null;

  await updateQuery(`DELETE FROM video_categories WHERE video_id = ?`, [videoId]);

  if (normalized.length) {
    const placeholders = normalized.map(() => "(?, ?, ?)").join(", ");
    const params: any[] = [];
    normalized.forEach((id) => {
      params.push(videoId, id, id === primary ? 1 : 0);
    });
    await insert(
      `INSERT INTO video_categories (video_id, category_id, is_primary) VALUES ${placeholders}`,
      params,
    );
  }

  return { categoryIds: normalized, primaryId: primary };
}

function mapRow(row: VideoRow, categoryIds?: string[]): Video {
  const metadata = parseMetadata(row.metadata);
  const tags = normalizeTags(metadata?.tags);
  const resolvedCategoryIds = normalizeCategoryIds(
    categoryIds ?? (row.category_id ? [row.category_id] : []),
  );
  return {
    id: row.id,
    title: normalizeLocalized(row.title),
    slug: normalizeLocalized(row.slug),
    description: normalizeLocalizedNullable(row.description),
    coverUrl: row.cover_url,
    sourceUrl: row.source_url,
    categoryId: row.category_id,
    categoryIds: resolvedCategoryIds.length ? resolvedCategoryIds : null,
    broadcastId: row.broadcast_id,
    type: row.type,
    duration: row.duration,
    views: Number(row.views || 0),
    status: row.status,
    isManshet: Boolean(row.is_manshet),
    isShort: Boolean(row.is_short),
    isSidebar: Boolean(row.is_sidebar),
    isTopVideo: Boolean(row.is_top_video),
    publishedAt: row.published_at ? row.published_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    tags: tags.length ? tags : null,
    metadata,
  };
}

export async function getAllVideos(limit = 500): Promise<Video[]> {
  const rows = await query<VideoRow>(
    `SELECT id, title, slug, description,
            cover_url, source_url, category_id, broadcast_id,
            type, duration, views, status,
            is_manshet, is_short, is_sidebar, is_top_video,
            published_at, created_at, updated_at, metadata
     FROM videos
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit],
  );
  const categoryMap = await getVideoCategoryMap(rows.map((row) => row.id));
  return rows.map((row) => mapRow(row, categoryMap.get(row.id)));
}

function buildFilters(filters?: VideoFilters) {
  const where: string[] = [];
  const params: any[] = [];

  if (filters?.status) {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters?.categoryId) {
    where.push(
      "(category_id = ? OR EXISTS (SELECT 1 FROM video_categories vc WHERE vc.video_id = videos.id AND vc.category_id = ?))",
    );
    params.push(filters.categoryId, filters.categoryId);
  }
  if (filters?.broadcastId) {
    where.push("broadcast_id = ?");
    params.push(filters.broadcastId);
  }
  if (filters?.search) {
    const search = `%${filters.search.toLowerCase()}%`;
    where.push(
      "(LOWER(CAST(title AS CHAR)) LIKE ? OR LOWER(CAST(slug AS CHAR)) LIKE ?)",
    );
    params.push(search, search);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}

export async function getVideosList(options?: {
  page?: number;
  limit?: number;
  filters?: VideoFilters;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  const { whereSql, params } = buildFilters(options?.filters);

  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM videos ${whereSql}`,
    params,
  );

  const rows = await query<VideoRow>(
    `SELECT id, title, slug, description,
            cover_url, source_url, category_id, broadcast_id,
            type, duration, views, status,
            is_manshet, is_short, is_sidebar, is_top_video,
            published_at, created_at, updated_at, metadata
     FROM videos
     ${whereSql}
     ORDER BY updated_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const categoryMap = await getVideoCategoryMap(rows.map((row) => row.id));
  return {
    videos: rows.map((row) => mapRow(row, categoryMap.get(row.id))),
    total: totalRow?.count ?? 0,
  };
}

export async function getVideoById(id: string): Promise<Video | null> {
  const row = await queryOne<VideoRow>(
    `SELECT id, title, slug, description,
            cover_url, source_url, category_id, broadcast_id,
            type, duration, views, status,
            is_manshet, is_short, is_sidebar, is_top_video,
            published_at, created_at, updated_at, metadata
     FROM videos
     WHERE id = ?`,
    [id],
  );
  if (!row) return null;
  const categoryMap = await getVideoCategoryMap([row.id]);
  return mapRow(row, categoryMap.get(row.id));
}

export async function getPublishedVideoBySlug(
  slug: string,
  locale: string,
  fallbackLocale: string = defaultLocale,
): Promise<Video | null> {
  const localeCandidates = Array.from(
    new Set([locale, fallbackLocale, ...locales]),
  );
  const conditions = localeCandidates
    .map(() => "JSON_UNQUOTE(JSON_EXTRACT(slug, ?)) = ?")
    .join(" OR ");
  const params: any[] = [];
  localeCandidates.forEach((candidate) => {
    params.push(jsonPathForLocale(candidate, fallbackLocale), slug);
  });
  const row = await queryOne<VideoRow>(
    `SELECT id, title, slug, description,
            cover_url, source_url, category_id, broadcast_id,
            type, duration, views, status,
            is_manshet, is_short, is_sidebar, is_top_video,
            published_at, created_at, updated_at, metadata
     FROM videos
     WHERE status = 'published'
       AND (${conditions})
     LIMIT 1`,
    params,
  );
  if (!row) return null;
  const categoryMap = await getVideoCategoryMap([row.id]);
  return mapRow(row, categoryMap.get(row.id));
}

export async function getPublishedVideos(options?: {
  limit?: number;
  categoryId?: string | null;
  broadcastId?: string | null;
  flags?: Partial<Pick<Video, "isManshet" | "isShort" | "isSidebar" | "isTopVideo">>;
}): Promise<Video[]> {
  const limit = options?.limit ?? 100;
  const where: string[] = ["status = 'published'"];
  const params: any[] = [];

  if (options?.categoryId) {
    where.push(
      "(category_id = ? OR EXISTS (SELECT 1 FROM video_categories vc WHERE vc.video_id = videos.id AND vc.category_id = ?))",
    );
    params.push(options.categoryId, options.categoryId);
  }
  if (options?.broadcastId) {
    where.push("broadcast_id = ?");
    params.push(options.broadcastId);
  }
  const flags = options?.flags || {};
  if (flags.isManshet !== undefined) {
    where.push("is_manshet = ?");
    params.push(flags.isManshet ? 1 : 0);
  }
  if (flags.isShort !== undefined) {
    where.push("is_short = ?");
    params.push(flags.isShort ? 1 : 0);
  }
  if (flags.isSidebar !== undefined) {
    where.push("is_sidebar = ?");
    params.push(flags.isSidebar ? 1 : 0);
  }
  if (flags.isTopVideo !== undefined) {
    where.push("is_top_video = ?");
    params.push(flags.isTopVideo ? 1 : 0);
  }

  const rows = await query<VideoRow>(
    `SELECT id, title, slug, description,
            cover_url, source_url, category_id, broadcast_id,
            type, duration, views, status,
            is_manshet, is_short, is_sidebar, is_top_video,
            published_at, created_at, updated_at, metadata
     FROM videos
     WHERE ${where.join(" AND ")}
     ORDER BY published_at DESC, created_at DESC
     LIMIT ?`,
    [...params, limit],
  );
  const categoryMap = await getVideoCategoryMap(rows.map((row) => row.id));
  return rows.map((row) => mapRow(row, categoryMap.get(row.id)));
}

export async function getVideosByCategorySlug(
  slug: string,
  limit = 24,
): Promise<Video[]> {
  const category = await queryOne<{ id: string }>(
    `SELECT id FROM categories WHERE slug = ? LIMIT 1`,
    [slug],
  );
  if (!category?.id) return [];
  return getPublishedVideos({ categoryId: category.id, limit });
}

export async function createVideo(input: VideoCreateInput): Promise<Video> {
  const id = uuidv4();
  const now = new Date();
  const title = normalizeLocalized(input.title);
  const slug = input.slug
    ? normalizeLocalized(input.slug)
    : buildSlugMap(title, generateSlug);

  const description = input.description ?? null;
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
  const metadata = mergeTagsIntoMetadata(input.metadata ?? null, input.tags);
  const normalizedCategoryIds = normalizeCategoryIds(
    input.categoryIds ?? (input.categoryId ? [input.categoryId] : []),
  );
  const primaryCategoryId =
    input.categoryId && normalizedCategoryIds.includes(input.categoryId)
      ? input.categoryId
      : normalizedCategoryIds[0] ?? null;

  await insert(
    `INSERT INTO videos
     (id, title, slug, description,
      cover_url, source_url, category_id, broadcast_id,
      type, duration, views, status,
      is_manshet, is_short, is_sidebar, is_top_video,
      published_at, created_at, updated_at, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      JSON.stringify(title),
      JSON.stringify(slug),
      toJsonOrNull(description),
      input.coverUrl ?? null,
      input.sourceUrl ?? null,
      primaryCategoryId,
      input.broadcastId ?? null,
      input.type ?? "video",
      input.duration ?? null,
      input.views ?? 0,
      input.status ?? "draft",
      input.isManshet ? 1 : 0,
      input.isShort ? 1 : 0,
      input.isSidebar ? 1 : 0,
      input.isTopVideo ? 1 : 0,
      publishedAt,
      now,
      now,
      JSON.stringify(metadata ?? null),
    ],
  );

  const synced = await syncVideoCategories(
    id,
    normalizedCategoryIds,
    primaryCategoryId,
  );

  const row: VideoRow = {
    id,
    title,
    slug,
    description,
    cover_url: input.coverUrl ?? null,
    source_url: input.sourceUrl ?? null,
    category_id: primaryCategoryId,
    broadcast_id: input.broadcastId ?? null,
    type: input.type ?? "video",
    duration: input.duration ?? null,
    views: input.views ?? 0,
    status: input.status ?? "draft",
    is_manshet: Boolean(input.isManshet),
    is_short: Boolean(input.isShort),
    is_sidebar: Boolean(input.isSidebar),
    is_top_video: Boolean(input.isTopVideo),
    published_at: publishedAt,
    created_at: now,
    updated_at: now,
    metadata: metadata ?? null,
  };

  return mapRow(row, synced.categoryIds);
}

export async function updateVideo(
  input: VideoUpdateInput,
): Promise<Video | null> {
  const existing = await getVideoById(input.id);
  if (!existing) return null;

  const merged: Video = {
    ...existing,
    title: input.title ? mergeLocalized(existing.title, input.title) : existing.title,
    slug: input.slug ? mergeLocalized(existing.slug, input.slug) : existing.slug,
    description:
      input.description !== undefined
        ? input.description === null
          ? null
          : mergeLocalized(existing.description ?? {}, input.description)
        : existing.description,
    coverUrl:
      input.coverUrl !== undefined ? input.coverUrl : existing.coverUrl,
    sourceUrl:
      input.sourceUrl !== undefined ? input.sourceUrl : existing.sourceUrl,
    categoryId:
      input.categoryId !== undefined ? input.categoryId : existing.categoryId,
    categoryIds:
      input.categoryIds !== undefined ? input.categoryIds : existing.categoryIds,
    broadcastId:
      input.broadcastId !== undefined ? input.broadcastId : existing.broadcastId,
    type: input.type ?? existing.type,
    duration:
      input.duration !== undefined ? input.duration : existing.duration,
    views: input.views ?? existing.views,
    status: input.status ?? existing.status,
    isManshet:
      input.isManshet !== undefined ? input.isManshet : existing.isManshet,
    isShort: input.isShort !== undefined ? input.isShort : existing.isShort,
    isSidebar:
      input.isSidebar !== undefined ? input.isSidebar : existing.isSidebar,
    isTopVideo:
      input.isTopVideo !== undefined ? input.isTopVideo : existing.isTopVideo,
    publishedAt:
      input.publishedAt !== undefined ? input.publishedAt : existing.publishedAt,
    metadata:
      input.metadata !== undefined ? input.metadata : existing.metadata,
    updatedAt: new Date().toISOString(),
  };

  const mergedMetadata = mergeTagsIntoMetadata(merged.metadata, input.tags);
  const normalizedCategoryIds = normalizeCategoryIds(
    merged.categoryIds ??
      (merged.categoryId ? [merged.categoryId] : []),
  );
  const primaryCategoryId =
    merged.categoryId && normalizedCategoryIds.includes(merged.categoryId)
      ? merged.categoryId
      : normalizedCategoryIds[0] ?? null;

  await updateQuery(
    `UPDATE videos SET
      title = ?, slug = ?, description = ?,
      cover_url = ?, source_url = ?, category_id = ?, broadcast_id = ?,
      type = ?, duration = ?, views = ?, status = ?,
      is_manshet = ?, is_short = ?, is_sidebar = ?, is_top_video = ?,
      published_at = ?, updated_at = ?, metadata = ?
     WHERE id = ?`,
    [
      JSON.stringify(merged.title),
      JSON.stringify(merged.slug),
      toJsonOrNull(merged.description),
      merged.coverUrl ?? null,
      merged.sourceUrl ?? null,
      primaryCategoryId,
      merged.broadcastId ?? null,
      merged.type,
      merged.duration ?? null,
      merged.views ?? 0,
      merged.status,
      merged.isManshet ? 1 : 0,
      merged.isShort ? 1 : 0,
      merged.isSidebar ? 1 : 0,
      merged.isTopVideo ? 1 : 0,
      merged.publishedAt ? new Date(merged.publishedAt) : null,
      new Date(),
      JSON.stringify(mergedMetadata ?? null),
      merged.id,
    ],
  );

  const synced = await syncVideoCategories(
    merged.id,
    normalizedCategoryIds,
    primaryCategoryId,
  );
  const resolvedTags = normalizeTags(mergedMetadata?.tags);
  return {
    ...merged,
    categoryId: primaryCategoryId,
    categoryIds: synced.categoryIds.length ? synced.categoryIds : null,
    metadata: mergedMetadata,
    tags: resolvedTags.length ? resolvedTags : null,
  };
}

export async function deleteVideo(id: string): Promise<boolean> {
  const affected = await updateQuery(`DELETE FROM videos WHERE id = ?`, [id]);
  return affected > 0;
}

export async function getVideosCount(): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM videos`,
  );
  return row?.count ?? 0;
}

export async function getPublishedVideosCount(): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM videos WHERE status = 'published'`,
  );
  return row?.count ?? 0;
}

export async function getTopVideo(): Promise<Video | null> {
  const rows = await getPublishedVideos({ flags: { isTopVideo: true }, limit: 1 });
  return rows[0] ?? null;
}

export async function getManshetVideos(limit = 4): Promise<Video[]> {
  return getPublishedVideos({ flags: { isManshet: true }, limit });
}

export async function getShortVideos(limit = 12): Promise<Video[]> {
  return getPublishedVideos({ flags: { isShort: true }, limit });
}

export async function getSidebarVideos(limit = 10): Promise<Video[]> {
  return getPublishedVideos({ flags: { isSidebar: true }, limit });
}

export async function getVideoCountsByCategory(): Promise<Record<string, number>> {
  const rows = await query<{ category_id: string | null; count: number }>(
    `SELECT vc.category_id AS category_id, COUNT(DISTINCT vc.video_id) AS count
     FROM video_categories vc
     GROUP BY vc.category_id`,
  );
  const result: Record<string, number> = {};
  rows.forEach((row) => {
    if (row.category_id) {
      result[row.category_id] = Number(row.count || 0);
    }
  });
  return result;
}

export async function getVideoCountsByBroadcast(): Promise<Record<string, number>> {
  const rows = await query<{ broadcast_id: string | null; count: number }>(
    `SELECT broadcast_id, COUNT(*) AS count
     FROM videos
     WHERE broadcast_id IS NOT NULL
       AND status = 'published'
     GROUP BY broadcast_id`,
  );
  const result: Record<string, number> = {};
  rows.forEach((row) => {
    if (row.broadcast_id) {
      result[row.broadcast_id] = Number(row.count || 0);
    }
  });
  return result;
}

export async function getPublishedVideoCountsByCategory(): Promise<Record<string, number>> {
  const rows = await query<{ category_id: string | null; count: number }>(
    `SELECT vc.category_id AS category_id, COUNT(DISTINCT vc.video_id) AS count
     FROM video_categories vc
     INNER JOIN videos v ON v.id = vc.video_id
     WHERE v.status = 'published'
     GROUP BY vc.category_id`,
  );
  const result: Record<string, number> = {};
  rows.forEach((row) => {
    if (row.category_id) {
      result[row.category_id] = Number(row.count || 0);
    }
  });
  return result;
}
