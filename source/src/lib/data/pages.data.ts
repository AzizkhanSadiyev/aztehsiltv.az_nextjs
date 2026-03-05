/**
 * Pages Data Access Layer (MySQL)
 */

import { v4 as uuidv4 } from "uuid";
import { query, queryOne, insert, update as updateQuery } from "@/lib/db";
import { defaultLocale } from "@/i18n/config";
import {
  mergeLocalized,
  normalizeLocalized,
  normalizeLocalizedNullable,
  pickLocalized,
  toJsonOrNull,
} from "@/lib/localization";
import { slugify } from "@/lib/slugify";
import type { LocalizedString } from "@/types/admin.types";
import type {
  Page,
  PageCreateInput,
  PageUpdateInput,
} from "@/types/page.types";

type PageRow = {
  id: string;
  slug: string;
  title: any;
  description: any;
  status: "draft" | "published";
  created_at: Date;
  updated_at: Date;
};

export const resolvePageSlug = (title: LocalizedString, slug?: string | null) => {
  const trimmed = slug?.trim();
  if (trimmed) return trimmed;
  const source =
    pickLocalized(title, defaultLocale, defaultLocale) ||
    Object.values(title || {}).find((value) => value.trim().length > 0) ||
    "";
  return slugify(source);
};

function mapRow(row: PageRow): Page {
  return {
    id: row.id,
    slug: row.slug,
    title: normalizeLocalized(row.title),
    description: normalizeLocalizedNullable(row.description),
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getAllPages(): Promise<Page[]> {
  const rows = await query<PageRow>(
    `SELECT id, slug, title, description, status, created_at, updated_at
     FROM pages
     ORDER BY updated_at DESC, created_at DESC`,
  );
  return rows.map((row) => mapRow(row));
}

export async function getPageById(id: string): Promise<Page | null> {
  const row = await queryOne<PageRow>(
    `SELECT id, slug, title, description, status, created_at, updated_at
     FROM pages
     WHERE id = ?`,
    [id],
  );
  return row ? mapRow(row) : null;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const row = await queryOne<PageRow>(
    `SELECT id, slug, title, description, status, created_at, updated_at
     FROM pages
     WHERE slug = ?
     LIMIT 1`,
    [slug],
  );
  return row ? mapRow(row) : null;
}

export async function getPublishedPageBySlug(
  slug: string,
): Promise<Page | null> {
  const row = await queryOne<PageRow>(
    `SELECT id, slug, title, description, status, created_at, updated_at
     FROM pages
     WHERE slug = ? AND status = 'published'
     LIMIT 1`,
    [slug],
  );
  return row ? mapRow(row) : null;
}

export async function isPageSlugTaken(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM pages WHERE slug = ? ${excludeId ? "AND id <> ?" : ""} LIMIT 1`,
    excludeId ? [slug, excludeId] : [slug],
  );
  return Boolean(row?.id);
}

export async function createPage(input: PageCreateInput): Promise<Page> {
  const id = uuidv4();
  const now = new Date();
  const title = normalizeLocalized(input.title);
  const description = input.description
    ? normalizeLocalized(input.description)
    : null;
  const slug = resolvePageSlug(title, input.slug);
  const status = input.status ?? "draft";

  await insert(
    `INSERT INTO pages (id, slug, title, description, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      slug,
      JSON.stringify(title),
      toJsonOrNull(description),
      status,
      now,
      now,
    ],
  );

  return {
    id,
    slug,
    title,
    description,
    status,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export async function updatePage(
  input: PageUpdateInput,
): Promise<Page | null> {
  const existing = await getPageById(input.id);
  if (!existing) return null;

  const title = input.title
    ? mergeLocalized(existing.title, input.title)
    : existing.title;
  const description =
    input.description !== undefined
      ? input.description
        ? mergeLocalized(existing.description || {}, input.description)
        : null
      : existing.description;
  const slug = resolvePageSlug(title, input.slug ?? existing.slug);
  const status = input.status ?? existing.status;

  await updateQuery(
    `UPDATE pages SET slug = ?, title = ?, description = ?, status = ?, updated_at = ?
     WHERE id = ?`,
    [
      slug,
      JSON.stringify(title),
      toJsonOrNull(description),
      status,
      new Date(),
      existing.id,
    ],
  );

  return {
    ...existing,
    slug,
    title,
    description,
    status,
    updatedAt: new Date().toISOString(),
  };
}

export async function deletePage(id: string): Promise<boolean> {
  const affected = await updateQuery(`DELETE FROM pages WHERE id = ?`, [id]);
  return affected > 0;
}
