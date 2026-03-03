/**
 * Media Data Access Layer (MySQL)
 */

import { v4 as uuidv4 } from "uuid";
import { query, queryOne, insert, update as updateQuery } from "@/lib/db";
import {
  getMediaType,
  type Media,
  type MediaUpdateInput,
  type MediaFilters,
} from "@/types/media.types";
import {
  mergeLocalized,
  normalizeLocalizedNullable,
  toJsonOrNull,
} from "@/lib/localization";

type MediaRow = {
  id: string;
  filename: string;
  url: string;
  path: string;
  mime_type: string;
  type: Media["type"];
  size: number;
  width: number | null;
  height: number | null;
  alt: any;
  title: any;
  uploaded_by: string;
  uploaded_at: Date;
  metadata: any;
};

const parseMetadata = (value: any): Media["metadata"] => {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed || {};
    } catch {
      return {};
    }
  }
  return value as Media["metadata"];
};

const isExternalUrl = (value: string) => /^https?:\/\//i.test(value);

const isFilesystemPath = (value: string) =>
  value.includes("\\") ||
  /^[A-Za-z]:\\/.test(value) ||
  value.startsWith("public/") ||
  value.startsWith("source/");

const buildPublicUrlFromPath = (path: string) => {
  const publicBase =
    process.env.S3_CDN_PATH ||
    process.env.AWS_CDN_PATH ||
    process.env.S3_PUBLIC_URL ||
    process.env.AWS_PUBLIC_URL ||
    "";
  if (!publicBase) return null;
  return `${publicBase.replace(/\/+$/g, "")}/${path.replace(/^\/+/, "")}`;
};

const resolveMediaUrl = (row: MediaRow) => {
  const storageType = (process.env.STORAGE_TYPE || "s3").toLowerCase();
  const cdnPath = process.env.S3_CDN_PATH || process.env.AWS_CDN_PATH || "";
  if (row.url && row.url.startsWith("/")) {
    if (
      storageType !== "local" &&
      cdnPath &&
      row.url.startsWith("/uploads/")
    ) {
      return `${cdnPath}${row.url}`;
    }
    return row.url;
  }
  const pathValue = row.path;
  if (!pathValue) return row.url;
  if (isExternalUrl(pathValue)) return pathValue;
  if (isFilesystemPath(pathValue)) return row.url;
  const publicUrl = buildPublicUrlFromPath(pathValue);
  return publicUrl || row.url;
};

function mapRow(row: MediaRow): Media {
  const resolvedType = row.type || getMediaType(row.mime_type);
  return {
    id: row.id,
    filename: row.filename,
    url: resolveMediaUrl(row),
    path: row.path,
    mimeType: row.mime_type,
    type: resolvedType,
    size: row.size,
    width: row.width,
    height: row.height,
    alt: normalizeLocalizedNullable(row.alt),
    title: normalizeLocalizedNullable(row.title),
    uploadedBy: row.uploaded_by,
    uploadedAt: row.uploaded_at.toISOString(),
    metadata: parseMetadata(row.metadata),
  };
}

function buildFilters(filters?: MediaFilters) {
  const where: string[] = [];
  const params: any[] = [];

  if (filters?.type) {
    where.push("type = ?");
    params.push(filters.type);
  }

  if (filters?.folder) {
    where.push("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.folder')) = ?");
    params.push(filters.folder);
  }

  if (filters?.search) {
    const search = `%${filters.search.toLowerCase()}%`;
    where.push(
      "(LOWER(filename) LIKE ? OR LOWER(CAST(alt AS CHAR)) LIKE ? OR LOWER(CAST(title AS CHAR)) LIKE ?)",
    );
    params.push(search, search, search);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}

/**
 * Get all media with optional filters and pagination
 */
export async function getAllMedia(options?: {
  page?: number;
  limit?: number;
  filters?: MediaFilters;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  const { whereSql, params } = buildFilters(options?.filters);

  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM media ${whereSql}`,
    params,
  );

  const rows = await query<MediaRow>(
    `SELECT id, filename, url, path, mime_type, type, size, width, height,
            alt, title,
            uploaded_by, uploaded_at, metadata
     FROM media
     ${whereSql}
     ORDER BY uploaded_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return {
    media: rows.map((row) => mapRow(row)),
    total: totalRow?.count ?? 0,
  };
}

/**
 * Get media by ID
 */
export async function getMediaById(id: string): Promise<Media | null> {
  const row = await queryOne<MediaRow>(
    `SELECT id, filename, url, path, mime_type, type, size, width, height,
            alt, title,
            uploaded_by, uploaded_at, metadata
     FROM media
     WHERE id = ?`,
    [id],
  );

  return row ? mapRow(row) : null;
}

/**
 * Create media entry
 */
type MediaCreateInput = Omit<Media, "id" | "uploadedAt" | "type"> & {
  type?: Media["type"];
};

export async function createMedia(
  data: MediaCreateInput,
): Promise<Media> {
  const id = uuidv4();
  const now = new Date();
  const resolvedType = data.type || getMediaType(data.mimeType);

  await insert(
    `INSERT INTO media
     (id, filename, url, path, mime_type, type, size, width, height,
      alt, title,
      uploaded_by, uploaded_at, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.filename,
      data.url,
      data.path,
      data.mimeType,
      resolvedType,
      data.size,
      data.width,
      data.height,
      toJsonOrNull(data.alt ?? null),
      toJsonOrNull(data.title ?? null),
      data.uploadedBy,
      now,
      JSON.stringify(data.metadata ?? {}),
    ],
  );

  const row: MediaRow = {
    id,
    filename: data.filename,
    url: data.url,
    path: data.path,
    mime_type: data.mimeType,
    type: resolvedType,
    size: data.size,
    width: data.width,
    height: data.height,
    alt: data.alt ?? null,
    title: data.title ?? null,
    uploaded_by: data.uploadedBy,
    uploaded_at: now,
    metadata: data.metadata ?? {},
  };

  return mapRow(row);
}

/**
 * Update media metadata
 */
export async function updateMedia(
  input: MediaUpdateInput,
): Promise<Media | null> {
  const existing = await getMediaById(input.id);
  if (!existing) return null;

  const merged: Media = {
    ...existing,
    alt:
      input.alt !== undefined
        ? input.alt === null
          ? null
          : mergeLocalized(existing.alt ?? {}, input.alt)
        : existing.alt,
    title:
      input.title !== undefined
        ? input.title === null
          ? null
          : mergeLocalized(existing.title ?? {}, input.title)
        : existing.title,
    metadata: {
      ...(existing.metadata || {}),
      ...(input.metadata || {}),
    },
  };

  await updateQuery(
    `UPDATE media SET
      alt = ?, title = ?, metadata = ?
     WHERE id = ?`,
    [
      toJsonOrNull(merged.alt),
      toJsonOrNull(merged.title),
      JSON.stringify(merged.metadata ?? {}),
      merged.id,
    ],
  );

  return merged;
}

/**
 * Delete media
 */
export async function deleteMedia(id: string): Promise<boolean> {
  const affected = await updateQuery(`DELETE FROM media WHERE id = ?`, [id]);
  return affected > 0;
}

/**
 * Get media by type
 */
export async function getMediaByType(type: string): Promise<Media[]> {
  if (type !== "image" && type !== "video" && type !== "document" && type !== "other") {
    return [];
  }
  const result = await getAllMedia({
    page: 1,
    limit: 500,
    filters: { type },
  });
  return result.media;
}

/**
 * Get media count
 */
export async function getMediaCount(): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM media`,
  );
  return row?.count ?? 0;
}

/**
 * Get total storage size
 */
export async function getTotalStorageSize(): Promise<number> {
  const row = await queryOne<{ total: number }>(
    `SELECT COALESCE(SUM(size), 0) AS total FROM media`,
  );
  return row?.total ?? 0;
}

/**
 * Get media by folder
 */
export async function getMediaByFolder(folder: string): Promise<Media[]> {
  const result = await getAllMedia({
    page: 1,
    limit: 500,
    filters: { folder },
  });
  return result.media;
}
