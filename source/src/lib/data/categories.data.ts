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
import type { LocalizedString } from "@/types/admin.types";

type CategoryRow = {
  id: string;
  name_az: string;
  name_en: string;
  name_ru: string;
  slug_az: string;
  slug_en: string;
  slug_ru: string;
  description_az: string | null;
  description_en: string | null;
  description_ru: string | null;
  parent_id: string | null;
  icon: string | null;
  color: string;
  order: number;
  positions: string | null;
  is_active: number | boolean;
  created_at: Date;
  updated_at: Date;
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

const generateSlug = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

function mapRow(row: CategoryRow): Category {
  const positions = normalizePositions(parsePositions(row.positions));

  return {
    id: row.id,
    name: toLocalized(row.name_az, row.name_en, row.name_ru),
    slug: toLocalized(row.slug_az, row.slug_en, row.slug_ru),
    description: toLocalizedNullable(
      row.description_az,
      row.description_en,
      row.description_ru,
    ),
    parentId: row.parent_id,
    icon: row.icon,
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
            name_az, name_en, name_ru,
            slug_az, slug_en, slug_ru,
            description_az, description_en, description_ru,
            parent_id, icon, color, \`order\`, positions, is_active,
            created_at, updated_at
     FROM categories
     ORDER BY \`order\` ASC, updated_at DESC`,
  );

  return rows.map((row) => mapRow(row));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const row = await queryOne<CategoryRow>(
    `SELECT id,
            name_az, name_en, name_ru,
            slug_az, slug_en, slug_ru,
            description_az, description_en, description_ru,
            parent_id, icon, color, \`order\`, positions, is_active,
            created_at, updated_at
     FROM categories
     WHERE id = ?`,
    [id],
  );

  return row ? mapRow(row) : null;
}

export async function getCategoryBySlug(
  slug: string,
  locale: string,
): Promise<Category | null> {
  const column = locale === "az" ? "slug_az" : locale === "ru" ? "slug_ru" : "slug_en";
  const row = await queryOne<CategoryRow>(
    `SELECT id,
            name_az, name_en, name_ru,
            slug_az, slug_en, slug_ru,
            description_az, description_en, description_ru,
            parent_id, icon, color, \`order\`, positions, is_active,
            created_at, updated_at
     FROM categories
     WHERE ${column} = ?
     LIMIT 1`,
    [slug],
  );

  return row ? mapRow(row) : null;
}

export async function createCategory(
  input: CategoryCreateInput,
): Promise<Category> {
  const id = uuidv4();
  const now = new Date();

  const slug = input.slug ?? {
    az: generateSlug(input.name.az),
    en: generateSlug(input.name.en),
    ru: generateSlug(input.name.ru),
  };

  const positions = normalizePositions(input.positions);
  const description = input.description ?? null;

  await insert(
    `INSERT INTO categories
     (id,
      name_az, name_en, name_ru,
      slug_az, slug_en, slug_ru,
      description_az, description_en, description_ru,
      parent_id, icon, color, \`order\`, positions, is_active,
      created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name.az,
      input.name.en,
      input.name.ru,
      slug.az,
      slug.en,
      slug.ru,
      description?.az ?? null,
      description?.en ?? null,
      description?.ru ?? null,
      input.parentId ?? null,
      input.icon ?? null,
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
    name_az: input.name.az,
    name_en: input.name.en,
    name_ru: input.name.ru,
    slug_az: slug.az,
    slug_en: slug.en,
    slug_ru: slug.ru,
    description_az: description?.az ?? null,
    description_en: description?.en ?? null,
    description_ru: description?.ru ?? null,
    parent_id: input.parentId ?? null,
    icon: input.icon ?? null,
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
    name: input.name ?? existing.name,
    slug: input.slug ?? existing.slug,
    description:
      input.description !== undefined ? input.description : existing.description,
    parentId:
      input.parentId !== undefined ? input.parentId : existing.parentId,
    icon: input.icon !== undefined ? input.icon : existing.icon,
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
      name_az = ?, name_en = ?, name_ru = ?,
      slug_az = ?, slug_en = ?, slug_ru = ?,
      description_az = ?, description_en = ?, description_ru = ?,
      parent_id = ?, icon = ?, color = ?, \`order\` = ?, positions = ?, is_active = ?, updated_at = ?
     WHERE id = ?`,
    [
      merged.name.az,
      merged.name.en,
      merged.name.ru,
      merged.slug.az,
      merged.slug.en,
      merged.slug.ru,
      merged.description?.az ?? null,
      merged.description?.en ?? null,
      merged.description?.ru ?? null,
      merged.parentId ?? null,
      merged.icon ?? null,
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

export async function getActiveCategories(): Promise<Category[]> {
  const rows = await query<CategoryRow>(
    `SELECT id,
            name_az, name_en, name_ru,
            slug_az, slug_en, slug_ru,
            description_az, description_en, description_ru,
            parent_id, icon, color, \`order\`, positions, is_active,
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
            name_az, name_en, name_ru,
            slug_az, slug_en, slug_ru,
            description_az, description_en, description_ru,
            parent_id, icon, color, \`order\`, positions, is_active,
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
