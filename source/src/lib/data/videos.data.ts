/**
 * Videos Data Access Layer (MySQL)
 */

import { v4 as uuidv4 } from "uuid";
import { query, queryOne, insert, update as updateQuery } from "@/lib/db";
import type {
  Video,
  VideoCreateInput,
  VideoUpdateInput,
  VideoStatus,
} from "@/types/video.types";
import type { LocalizedString, Locale } from "@/types/admin.types";

type VideoRow = {
  id: string;
  title_az: string;
  title_en: string;
  title_ru: string;
  slug_az: string;
  slug_en: string;
  slug_ru: string;
  description_az: string | null;
  description_en: string | null;
  description_ru: string | null;
  cover_url: string | null;
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

const toLocalized = (az: string, en: string, ru: string): LocalizedString => ({
  az: az ?? "",
  en: en ?? "",
  ru: ru ?? "",
});

const toLocalizedNullable = (
  az: string | null,
  en: string | null,
  ru: string | null,
): LocalizedString | null => {
  if (az == null && en == null && ru == null) return null;
  return {
    az: az ?? "",
    en: en ?? "",
    ru: ru ?? "",
  };
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

const generateSlug = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

function mapRow(row: VideoRow): Video {
  return {
    id: row.id,
    title: toLocalized(row.title_az, row.title_en, row.title_ru),
    slug: toLocalized(row.slug_az, row.slug_en, row.slug_ru),
    description: toLocalizedNullable(
      row.description_az,
      row.description_en,
      row.description_ru,
    ),
    coverUrl: row.cover_url,
    categoryId: row.category_id,
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
    metadata: parseMetadata(row.metadata),
  };
}

export async function getAllVideos(limit = 500): Promise<Video[]> {
  const rows = await query<VideoRow>(
    `SELECT id, title_az, title_en, title_ru,
            slug_az, slug_en, slug_ru,
            description_az, description_en, description_ru,
            cover_url, category_id, broadcast_id,
            type, duration, views, status,
            is_manshet, is_short, is_sidebar, is_top_video,
            published_at, created_at, updated_at, metadata
     FROM videos
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit],
  );
  return rows.map(mapRow);
}

function buildFilters(filters?: VideoFilters) {
  const where: string[] = [];
  const params: any[] = [];

  if (filters?.status) {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters?.categoryId) {
    where.push("category_id = ?");
    params.push(filters.categoryId);
  }
  if (filters?.broadcastId) {
    where.push("broadcast_id = ?");
    params.push(filters.broadcastId);
  }
  if (filters?.search) {
    const search = `%${filters.search.toLowerCase()}%`;
    where.push(
      "(LOWER(title_az) LIKE ? OR LOWER(title_en) LIKE ? OR LOWER(title_ru) LIKE ? OR LOWER(slug_az) LIKE ? OR LOWER(slug_en) LIKE ? OR LOWER(slug_ru) LIKE ?)",
    );
    params.push(search, search, search, search, search, search);
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
    `SELECT id, title_az, title_en, title_ru,
            slug_az, slug_en, slug_ru,
            description_az, description_en, description_ru,
            cover_url, category_id, broadcast_id,
            type, duration, views, status,
            is_manshet, is_short, is_sidebar, is_top_video,
            published_at, created_at, updated_at, metadata
     FROM videos
     ${whereSql}
     ORDER BY updated_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return {
    videos: rows.map(mapRow),
    total: totalRow?.count ?? 0,
  };
}

export async function getVideoById(id: string): Promise<Video | null> {
  const row = await queryOne<VideoRow>(
    `SELECT id, title_az, title_en, title_ru,
            slug_az, slug_en, slug_ru,
            description_az, description_en, description_ru,
            cover_url, category_id, broadcast_id,
            type, duration, views, status,
            is_manshet, is_short, is_sidebar, is_top_video,
            published_at, created_at, updated_at, metadata
     FROM videos
     WHERE id = ?`,
    [id],
  );
  return row ? mapRow(row) : null;
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
    where.push("category_id = ?");
    params.push(options.categoryId);
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
    `SELECT id, title_az, title_en, title_ru,
            slug_az, slug_en, slug_ru,
            description_az, description_en, description_ru,
            cover_url, category_id, broadcast_id,
            type, duration, views, status,
            is_manshet, is_short, is_sidebar, is_top_video,
            published_at, created_at, updated_at, metadata
     FROM videos
     WHERE ${where.join(" AND ")}
     ORDER BY published_at DESC, created_at DESC
     LIMIT ?`,
    [...params, limit],
  );
  return rows.map(mapRow);
}

export async function getVideosByCategorySlug(
  slug: string,
  locale: Locale,
  limit = 24,
): Promise<Video[]> {
  const slugColumn =
    locale === "az" ? "slug_az" : locale === "ru" ? "slug_ru" : "slug_en";
  const category = await queryOne<{ id: string }>(
    `SELECT id FROM categories WHERE ${slugColumn} = ? LIMIT 1`,
    [slug],
  );
  if (!category?.id) return [];
  return getPublishedVideos({ categoryId: category.id, limit });
}

export async function createVideo(input: VideoCreateInput): Promise<Video> {
  const id = uuidv4();
  const now = new Date();
  const slug = input.slug ?? {
    az: generateSlug(input.title.az),
    en: generateSlug(input.title.en),
    ru: generateSlug(input.title.ru),
  };

  const description = input.description ?? null;
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;

  await insert(
    `INSERT INTO videos
     (id, title_az, title_en, title_ru,
      slug_az, slug_en, slug_ru,
      description_az, description_en, description_ru,
      cover_url, category_id, broadcast_id,
      type, duration, views, status,
      is_manshet, is_short, is_sidebar, is_top_video,
      published_at, created_at, updated_at, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.title.az,
      input.title.en,
      input.title.ru,
      slug.az,
      slug.en,
      slug.ru,
      description?.az ?? null,
      description?.en ?? null,
      description?.ru ?? null,
      input.coverUrl ?? null,
      input.categoryId ?? null,
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
      JSON.stringify(input.metadata ?? null),
    ],
  );

  const row: VideoRow = {
    id,
    title_az: input.title.az,
    title_en: input.title.en,
    title_ru: input.title.ru,
    slug_az: slug.az,
    slug_en: slug.en,
    slug_ru: slug.ru,
    description_az: description?.az ?? null,
    description_en: description?.en ?? null,
    description_ru: description?.ru ?? null,
    cover_url: input.coverUrl ?? null,
    category_id: input.categoryId ?? null,
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
    metadata: input.metadata ?? null,
  };

  return mapRow(row);
}

export async function updateVideo(
  input: VideoUpdateInput,
): Promise<Video | null> {
  const existing = await getVideoById(input.id);
  if (!existing) return null;

  const merged: Video = {
    ...existing,
    title: input.title ?? existing.title,
    slug: input.slug ?? existing.slug,
    description:
      input.description !== undefined ? input.description : existing.description,
    coverUrl:
      input.coverUrl !== undefined ? input.coverUrl : existing.coverUrl,
    categoryId:
      input.categoryId !== undefined ? input.categoryId : existing.categoryId,
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

  await updateQuery(
    `UPDATE videos SET
      title_az = ?, title_en = ?, title_ru = ?,
      slug_az = ?, slug_en = ?, slug_ru = ?,
      description_az = ?, description_en = ?, description_ru = ?,
      cover_url = ?, category_id = ?, broadcast_id = ?,
      type = ?, duration = ?, views = ?, status = ?,
      is_manshet = ?, is_short = ?, is_sidebar = ?, is_top_video = ?,
      published_at = ?, updated_at = ?, metadata = ?
     WHERE id = ?`,
    [
      merged.title.az,
      merged.title.en,
      merged.title.ru,
      merged.slug.az,
      merged.slug.en,
      merged.slug.ru,
      merged.description?.az ?? null,
      merged.description?.en ?? null,
      merged.description?.ru ?? null,
      merged.coverUrl ?? null,
      merged.categoryId ?? null,
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
      JSON.stringify(merged.metadata ?? null),
      merged.id,
    ],
  );

  return merged;
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
    `SELECT category_id, COUNT(*) AS count
     FROM videos
     WHERE category_id IS NOT NULL
     GROUP BY category_id`,
  );
  const result: Record<string, number> = {};
  rows.forEach((row) => {
    if (row.category_id) {
      result[row.category_id] = Number(row.count || 0);
    }
  });
  return result;
}
