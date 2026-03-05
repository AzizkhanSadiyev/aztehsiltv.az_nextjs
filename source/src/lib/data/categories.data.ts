/**
 * Categories Data Access Layer (MySQL)
 */

import { v4 as uuidv4 } from "uuid";
import { query, queryOne, insert, update as updateQuery } from "@/lib/db";
import type {
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
  CategoryWithChildren,
} from "@/types/category.types";
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

type CategoryRow = {
  id: string;
  name: any;
  slug: any;
  description: any;
  parent_id: string | null;
  icon: string | null;
  cover_url: string | null;
  color: string;
  order: number;
  positions: string | null;
  is_active: number | boolean;
  created_at: Date;
  updated_at: Date;
};

const parsePositions = (value: any): number[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v) => Number.isFinite(v));
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((v) => Number.isFinite(v));
      }
    } catch {
      return [];
    }
  }
  return [];
};

const normalizePositions = (positions?: number[] | null): number[] => {
  const cleaned = (positions || []).filter((pos) => pos === 1 || pos === 2);
  if (cleaned.length === 0) return [1, 2];
  return Array.from(new Set(cleaned));
};

export const resolveCategorySlug = (
  name: LocalizedString,
  slug?: string | null,
): string => {
  const trimmed = slug?.trim();
  if (trimmed) return trimmed;
  const source =
    pickLocalized(name, defaultLocale, defaultLocale) ||
    Object.values(name || {}).find((value) => value.trim().length > 0) ||
    "";
  return slugify(source);
};

function mapRow(row: CategoryRow): Category {
  const positions = normalizePositions(parsePositions(row.positions));
  const slugValue =
    typeof row.slug === "string"
      ? row.slug
      : pickLocalized(normalizeLocalized(row.slug), defaultLocale, defaultLocale);

  return {
    id: row.id,
    name: normalizeLocalized(row.name),
    slug: slugValue,
    description: normalizeLocalizedNullable(row.description),
    parentId: row.parent_id,
    icon: row.icon,
    coverUrl: row.cover_url,
    color: row.color,
    order: row.order,
    positions,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getAllCategories(): Promise<Category[]> {
  const rows = await query<CategoryRow>(
    `SELECT id,
            name, slug, description,
            parent_id, icon, cover_url, color, \`order\`, positions, is_active,
            created_at, updated_at
     FROM categories
     ORDER BY \`order\` ASC, updated_at DESC`,
  );

  return rows.map((row) => mapRow(row));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const row = await queryOne<CategoryRow>(
    `SELECT id,
            name, slug, description,
            parent_id, icon, cover_url, color, \`order\`, positions, is_active,
            created_at, updated_at
     FROM categories
     WHERE id = ?`,
    [id],
  );

  return row ? mapRow(row) : null;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const row = await queryOne<CategoryRow>(
    `SELECT id,
            name, slug, description,
            parent_id, icon, cover_url, color, \`order\`, positions, is_active,
            created_at, updated_at
     FROM categories
     WHERE slug = ?
     LIMIT 1`,
    [slug],
  );

  return row ? mapRow(row) : null;
}

export async function isCategorySlugTaken(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const trimmed = slug.trim();
  if (!trimmed) return false;
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM categories WHERE slug = ? ${
      excludeId ? "AND id <> ?" : ""
    } LIMIT 1`,
    excludeId ? [trimmed, excludeId] : [trimmed],
  );
  return Boolean(row?.id);
}

export async function createCategory(
  input: CategoryCreateInput,
): Promise<Category> {
  const id = uuidv4();
  const now = new Date();

  const name = normalizeLocalized(input.name);
  const slug = resolveCategorySlug(name, input.slug);

  const positions = normalizePositions(input.positions);
  const description = input.description ?? null;

  await insert(
    `INSERT INTO categories
     (id,
      name, slug, description,
      parent_id, icon, cover_url, color, \`order\`, positions, is_active,
      created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      JSON.stringify(name),
      slug,
      toJsonOrNull(description),
      input.parentId ?? null,
      input.icon ?? null,
      input.coverUrl ?? null,
      input.color ?? "#6366f1",
      input.order ?? 0,
      JSON.stringify(positions),
      true,
      now,
      now,
    ],
  );

  const row: CategoryRow = {
    id,
    name,
    slug,
    description,
    parent_id: input.parentId ?? null,
    icon: input.icon ?? null,
    cover_url: input.coverUrl ?? null,
    color: input.color ?? "#6366f1",
    order: input.order ?? 0,
    positions: JSON.stringify(positions),
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  return mapRow(row);
}

export async function updateCategory(
  input: CategoryUpdateInput,
): Promise<Category | null> {
  const existing = await getCategoryById(input.id);
  if (!existing) return null;

  const merged: Category = {
    ...existing,
    name: input.name ? mergeLocalized(existing.name, input.name) : existing.name,
    slug: input.slug ? input.slug.trim() : existing.slug,
    description:
      input.description !== undefined
        ? input.description === null
          ? null
          : mergeLocalized(existing.description ?? {}, input.description)
        : existing.description,
    parentId:
      input.parentId !== undefined ? input.parentId : existing.parentId,
    icon: input.icon !== undefined ? input.icon : existing.icon,
    coverUrl:
      input.coverUrl !== undefined ? input.coverUrl : existing.coverUrl,
    color: input.color ?? existing.color,
    order: input.order ?? existing.order,
    positions: normalizePositions(
      input.positions !== undefined ? input.positions : existing.positions,
    ),
    isActive:
      input.isActive !== undefined ? input.isActive : existing.isActive,
    updatedAt: new Date().toISOString(),
  };

  await updateQuery(
    `UPDATE categories SET
      name = ?, slug = ?, description = ?,
      parent_id = ?, icon = ?, cover_url = ?, color = ?, \`order\` = ?, positions = ?, is_active = ?, updated_at = ?
     WHERE id = ?`,
    [
      JSON.stringify(merged.name),
      merged.slug,
      toJsonOrNull(merged.description),
      merged.parentId ?? null,
      merged.icon ?? null,
      merged.coverUrl ?? null,
      merged.color,
      merged.order,
      JSON.stringify(merged.positions ?? []),
      merged.isActive,
      new Date(),
      merged.id,
    ],
  );

  return merged;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const affected = await updateQuery(`DELETE FROM categories WHERE id = ?`, [id]);
  return affected > 0;
}

export async function deleteCategoryWithReparent(id: string): Promise<boolean> {
  // Detach child categories and related videos before deleting
  await updateQuery(`UPDATE categories SET parent_id = NULL WHERE parent_id = ?`, [id]);
  await updateQuery(`UPDATE videos SET category_id = NULL WHERE category_id = ?`, [id]);
  const affected = await updateQuery(`DELETE FROM categories WHERE id = ?`, [id]);
  return affected > 0;
}

export async function deleteCategoryCascade(id: string): Promise<number> {
  const categories = await getAllCategories();
  if (!categories.length) return 0;

  const childrenMap = new Map<string, string[]>();
  categories.forEach((category) => {
    if (category.parentId) {
      const list = childrenMap.get(category.parentId) ?? [];
      list.push(category.id);
      childrenMap.set(category.parentId, list);
    }
  });

  const toDelete = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const current = stack.pop();
    if (!current || toDelete.has(current)) continue;
    toDelete.add(current);
    const children = childrenMap.get(current);
    if (children) {
      stack.push(...children);
    }
  }

  const ids = Array.from(toDelete);
  if (!ids.length) return 0;
  const placeholders = ids.map(() => "?").join(",");
  await updateQuery(
    `UPDATE categories SET parent_id = NULL WHERE parent_id IN (${placeholders})`,
    ids,
  );
  await updateQuery(
    `UPDATE videos SET category_id = NULL WHERE category_id IN (${placeholders})`,
    ids,
  );
  const affected = await updateQuery(
    `DELETE FROM categories WHERE id IN (${placeholders})`,
    ids,
  );
  return affected;
}

export async function getActiveCategories(): Promise<Category[]> {
  const rows = await query<CategoryRow>(
    `SELECT id,
            name, slug, description,
            parent_id, icon, cover_url, color, \`order\`, positions, is_active,
            created_at, updated_at
     FROM categories
     WHERE is_active = TRUE
     ORDER BY \`order\` ASC, updated_at DESC`,
  );

  return rows.map((row) => mapRow(row));
}

export async function getCategoriesWithChildren(): Promise<CategoryWithChildren[]> {
  const categories = await getAllCategories();
  const categoryMap = new Map<string, CategoryWithChildren>();

  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  const rootCategories: CategoryWithChildren[] = [];
  categoryMap.forEach((cat) => {
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parent = categoryMap.get(cat.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(cat);
    } else {
      rootCategories.push(cat);
    }
  });

  return rootCategories;
}

export async function getChildCategories(parentId: string): Promise<Category[]> {
  const rows = await query<CategoryRow>(
    `SELECT id,
            name, slug, description,
            parent_id, icon, cover_url, color, \`order\`, positions, is_active,
            created_at, updated_at
     FROM categories
     WHERE parent_id = ?
     ORDER BY \`order\` ASC, updated_at DESC`,
    [parentId],
  );

  return rows.map((row) => mapRow(row));
}

export async function getCategoriesCount(): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM categories`,
  );
  return row?.count ?? 0;
}

export async function getActiveCategoriesCount(): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM categories WHERE is_active = TRUE`,
  );
  return row?.count ?? 0;
}

export async function categoryHasChildren(id: string): Promise<boolean> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM categories WHERE parent_id = ?`,
    [id],
  );
  return (row?.count ?? 0) > 0;
}

