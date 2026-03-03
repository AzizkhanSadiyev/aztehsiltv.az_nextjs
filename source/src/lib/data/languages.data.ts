/**
 * Languages Data Access Layer (MySQL)
 */

import { v4 as uuidv4 } from "uuid";
import { query, queryOne, insert, update as updateQuery } from "@/lib/db";
import type {
  Language,
  LanguageCreateInput,
  LanguageUpdateInput,
} from "@/types/language.types";

type LanguageRow = {
  id: string;
  code: string;
  name: string;
  native_name: string | null;
  is_active: number | boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

const normalizeCode = (value: string): string => value.trim().toLowerCase();

const normalizeOptionalText = (
  value?: string | null,
): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

function mapRow(row: LanguageRow): Language {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    nativeName: row.native_name,
    isActive: Boolean(row.is_active),
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getAllLanguages(
  activeOnly = false,
): Promise<Language[]> {
  const rows = await query<LanguageRow>(
    `SELECT id, code, name, native_name, is_active, sort_order, created_at, updated_at
     FROM languages
     ${activeOnly ? "WHERE is_active = TRUE" : ""}
     ORDER BY sort_order ASC, name ASC`,
  );
  return rows.map((row) => mapRow(row));
}

export async function getLanguageById(id: string): Promise<Language | null> {
  const row = await queryOne<LanguageRow>(
    `SELECT id, code, name, native_name, is_active, sort_order, created_at, updated_at
     FROM languages
     WHERE id = ?`,
    [id],
  );
  return row ? mapRow(row) : null;
}

export async function isLanguageCodeTaken(
  code: string,
  excludeId?: string,
): Promise<boolean> {
  const normalized = normalizeCode(code);
  if (!normalized) return false;
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM languages WHERE code = ? ${
      excludeId ? "AND id <> ?" : ""
    } LIMIT 1`,
    excludeId ? [normalized, excludeId] : [normalized],
  );
  return Boolean(row?.id);
}

export async function createLanguage(
  input: LanguageCreateInput,
): Promise<Language> {
  const id = uuidv4();
  const now = new Date();

  const code = normalizeCode(input.code);
  const name = input.name.trim();
  const nativeName = normalizeOptionalText(input.nativeName) ?? null;
  const isActive = input.isActive !== undefined ? input.isActive : true;
  const sortOrder = input.sortOrder ?? 0;

  await insert(
    `INSERT INTO languages
     (id, code, name, native_name, is_active, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, code, name, nativeName, isActive, sortOrder, now, now],
  );

  const row: LanguageRow = {
    id,
    code,
    name,
    native_name: nativeName,
    is_active: isActive,
    sort_order: sortOrder,
    created_at: now,
    updated_at: now,
  };

  return mapRow(row);
}

export async function updateLanguage(
  input: LanguageUpdateInput,
): Promise<Language | null> {
  const existing = await getLanguageById(input.id);
  if (!existing) return null;

  const merged: Language = {
    ...existing,
    code:
      input.code !== undefined
        ? normalizeCode(input.code)
        : existing.code,
    name: input.name !== undefined ? input.name.trim() : existing.name,
    nativeName:
      input.nativeName !== undefined
        ? normalizeOptionalText(input.nativeName) ?? null
        : existing.nativeName,
    isActive:
      input.isActive !== undefined ? input.isActive : existing.isActive,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    updatedAt: new Date().toISOString(),
  };

  await updateQuery(
    `UPDATE languages SET
      code = ?, name = ?, native_name = ?, is_active = ?, sort_order = ?, updated_at = ?
     WHERE id = ?`,
    [
      merged.code,
      merged.name,
      merged.nativeName,
      merged.isActive,
      merged.sortOrder,
      new Date(),
      merged.id,
    ],
  );

  return merged;
}

export async function deleteLanguage(id: string): Promise<boolean> {
  const affected = await updateQuery(`DELETE FROM languages WHERE id = ?`, [id]);
  return affected > 0;
}

export async function getLanguagesCount(): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM languages`,
  );
  return row?.count ?? 0;
}
