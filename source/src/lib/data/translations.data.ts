/**
 * Translations Data Access Layer (MySQL)
 */

import { v4 as uuidv4 } from "uuid";
import { query, queryOne, insert, update as updateQuery } from "@/lib/db";
import { defaultLocale } from "@/i18n/config";
import {
  mergeLocalized,
  normalizeLocalized,
  pickLocalized,
} from "@/lib/localization";
import type {
  Translation,
  TranslationCreateInput,
  TranslationUpdateInput,
} from "@/types/translation.types";
import type { LocalizedString } from "@/types/admin.types";

type TranslationRow = {
  id: string;
  key: string;
  value: any;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

const normalizeKey = (value: string): string => value.trim().toLowerCase();

function mapRow(row: TranslationRow): Translation {
  return {
    id: row.id,
    key: row.key,
    values: normalizeLocalized(row.value),
    description: row.description,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getAllTranslations(): Promise<Translation[]> {
  const rows = await query<TranslationRow>(
    `SELECT id, \`key\`, \`value\`, description, created_at, updated_at
     FROM translations
     ORDER BY \`key\` ASC`,
  );
  return rows.map((row) => mapRow(row));
}

export async function getTranslationById(
  id: string,
): Promise<Translation | null> {
  const row = await queryOne<TranslationRow>(
    `SELECT id, \`key\`, \`value\`, description, created_at, updated_at
     FROM translations
     WHERE id = ?`,
    [id],
  );
  return row ? mapRow(row) : null;
}

export async function getTranslationByKey(
  key: string,
): Promise<Translation | null> {
  const row = await queryOne<TranslationRow>(
    `SELECT id, \`key\`, \`value\`, description, created_at, updated_at
     FROM translations
     WHERE \`key\` = ?
     LIMIT 1`,
    [normalizeKey(key)],
  );
  return row ? mapRow(row) : null;
}

export async function isTranslationKeyTaken(
  key: string,
  excludeId?: string,
): Promise<boolean> {
  const normalized = normalizeKey(key);
  if (!normalized) return false;
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM translations WHERE \`key\` = ? ${
      excludeId ? "AND id <> ?" : ""
    } LIMIT 1`,
    excludeId ? [normalized, excludeId] : [normalized],
  );
  return Boolean(row?.id);
}

export async function createTranslation(
  input: TranslationCreateInput,
): Promise<Translation> {
  const id = uuidv4();
  const now = new Date();
  const key = normalizeKey(input.key);
  const values = normalizeLocalized(input.values);

  await insert(
    `INSERT INTO translations (id, \`key\`, \`value\`, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      key,
      JSON.stringify(values),
      input.description ?? null,
      now,
      now,
    ],
  );

  return {
    id,
    key,
    values,
    description: input.description ?? null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export async function updateTranslation(
  input: TranslationUpdateInput,
): Promise<Translation | null> {
  const existing = await getTranslationById(input.id);
  if (!existing) return null;

  const nextValues: LocalizedString = input.values
    ? mergeLocalized(existing.values, input.values)
    : existing.values;
  const next: Translation = {
    ...existing,
    key: input.key ? normalizeKey(input.key) : existing.key,
    values: nextValues,
    description:
      input.description !== undefined ? input.description : existing.description,
    updatedAt: new Date().toISOString(),
  };

  await updateQuery(
    `UPDATE translations SET \`key\` = ?, \`value\` = ?, description = ?, updated_at = ?
     WHERE id = ?`,
    [
      next.key,
      JSON.stringify(next.values),
      next.description ?? null,
      new Date(),
      next.id,
    ],
  );

  return next;
}

export async function deleteTranslation(id: string): Promise<boolean> {
  const affected = await updateQuery(
    `DELETE FROM translations WHERE id = ?`,
    [id],
  );
  return affected > 0;
}

export async function getTranslationsForLocale(
  locale: string,
  fallbackLocale: string = defaultLocale,
): Promise<Record<string, string>> {
  const rows = await query<TranslationRow>(
    `SELECT \`key\`, \`value\` FROM translations ORDER BY \`key\` ASC`,
  );
  const result: Record<string, string> = {};
  rows.forEach((row) => {
    const values = normalizeLocalized(row.value);
    const value = pickLocalized(values, locale, fallbackLocale).trim();
    if (value) {
      result[row.key] = value;
    }
  });
  return result;
}
