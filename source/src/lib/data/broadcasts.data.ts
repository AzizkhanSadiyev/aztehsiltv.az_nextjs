/**
 * Broadcasts Data Access Layer (MySQL)
 */

import { v4 as uuidv4 } from "uuid";
import { query, queryOne, insert, update as updateQuery } from "@/lib/db";
import type {
  Broadcast,
  BroadcastCreateInput,
  BroadcastUpdateInput,
  BroadcastStatus,
} from "@/types/broadcast.types";
import {
  buildSlugMap,
  mergeLocalized,
  normalizeLocalized,
  normalizeLocalizedNullable,
  toJsonOrNull,
} from "@/lib/localization";

type BroadcastRow = {
  id: string;
  title: any;
  slug: any;
  description: any;
  image_url: string;
  status: BroadcastStatus;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

const generateSlug = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

function mapRow(row: BroadcastRow): Broadcast {
  return {
    id: row.id,
    title: normalizeLocalized(row.title),
    slug: normalizeLocalized(row.slug),
    description: normalizeLocalizedNullable(row.description),
    imageUrl: row.image_url,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getAllBroadcasts(limit = 200): Promise<Broadcast[]> {
  const idRows = await query<{ id: string }>(
    `SELECT id
     FROM broadcasts FORCE INDEX (idx_broadcasts_sort_updated)
     ORDER BY sort_order, updated_at DESC
     LIMIT ?`,
    [limit],
  );

  if (!idRows.length) return [];

  const ids = idRows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(",");
  const rows = await query<BroadcastRow>(
    `SELECT id, title, slug, description,
            image_url, status, sort_order, created_at, updated_at
     FROM broadcasts
     WHERE id IN (${placeholders})`,
    ids,
  );

  const rowMap = new Map(rows.map((row) => [row.id, row]));
  return idRows
    .map(({ id }) => rowMap.get(id))
    .filter(Boolean)
    .map((row) => mapRow(row as BroadcastRow));
}

export async function getPublishedBroadcasts(limit = 200): Promise<Broadcast[]> {
  const idRows = await query<{ id: string }>(
    `SELECT id
     FROM broadcasts FORCE INDEX (idx_broadcasts_status_order_updated)
     WHERE status = 'published'
     ORDER BY sort_order, updated_at DESC
     LIMIT ?`,
    [limit],
  );

  if (!idRows.length) return [];

  const ids = idRows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(",");
  const rows = await query<BroadcastRow>(
    `SELECT id, title, slug, description,
            image_url, status, sort_order, created_at, updated_at
     FROM broadcasts
     WHERE id IN (${placeholders})`,
    ids,
  );

  const rowMap = new Map(rows.map((row) => [row.id, row]));
  return idRows
    .map(({ id }) => rowMap.get(id))
    .filter(Boolean)
    .map((row) => mapRow(row as BroadcastRow));
}

export async function getBroadcastById(id: string): Promise<Broadcast | null> {
  const row = await queryOne<BroadcastRow>(
    `SELECT id, title, slug, description,
            image_url, status, sort_order, created_at, updated_at
     FROM broadcasts
     WHERE id = ?`,
    [id],
  );

  return row ? mapRow(row) : null;
}

export async function createBroadcast(
  input: BroadcastCreateInput,
): Promise<Broadcast> {
  const id = uuidv4();
  const now = new Date();
  const title = normalizeLocalized(input.title);
  const slug = input.slug
    ? normalizeLocalized(input.slug)
    : buildSlugMap(title, generateSlug);
  const description = input.description ?? null;

  await insert(
    `INSERT INTO broadcasts
     (id, title, slug, description,
      image_url, status, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      JSON.stringify(title),
      JSON.stringify(slug),
      toJsonOrNull(description),
      input.imageUrl,
      input.status ?? "draft",
      input.sortOrder ?? 0,
      now,
      now,
    ],
  );

  const row: BroadcastRow = {
    id,
    title,
    slug,
    description,
    image_url: input.imageUrl,
    status: input.status ?? "draft",
    sort_order: input.sortOrder ?? 0,
    created_at: now,
    updated_at: now,
  };

  return mapRow(row);
}

export async function updateBroadcast(
  input: BroadcastUpdateInput,
): Promise<Broadcast | null> {
  const existing = await getBroadcastById(input.id);
  if (!existing) return null;

  const merged: Broadcast = {
    ...existing,
    title: input.title ? mergeLocalized(existing.title, input.title) : existing.title,
    slug: input.slug ? mergeLocalized(existing.slug, input.slug) : existing.slug,
    description:
      input.description !== undefined
        ? input.description === null
          ? null
          : mergeLocalized(existing.description ?? {}, input.description)
        : existing.description,
    imageUrl: input.imageUrl ?? existing.imageUrl,
    status: input.status ?? existing.status,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    updatedAt: new Date().toISOString(),
  };

  await updateQuery(
    `UPDATE broadcasts SET
      title = ?, slug = ?, description = ?,
      image_url = ?, status = ?, sort_order = ?, updated_at = ?
     WHERE id = ?`,
    [
      JSON.stringify(merged.title),
      JSON.stringify(merged.slug),
      toJsonOrNull(merged.description),
      merged.imageUrl,
      merged.status,
      merged.sortOrder,
      new Date(),
      merged.id,
    ],
  );

  return merged;
}

export async function deleteBroadcast(id: string): Promise<boolean> {
  const affected = await updateQuery(`DELETE FROM broadcasts WHERE id = ?`, [
    id,
  ]);
  return affected > 0;
}

export async function getBroadcastsCount(): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM broadcasts`,
  );
  return row?.count ?? 0;
}

export async function getPublishedBroadcastsCount(): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM broadcasts WHERE status = 'published'`,
  );
  return row?.count ?? 0;
}
