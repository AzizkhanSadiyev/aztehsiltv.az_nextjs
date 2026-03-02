/**
 * Partners Data Access Layer (MySQL)
 */

import { v4 as uuidv4 } from "uuid";
import { query, queryOne, insert, update as updateQuery } from "@/lib/db";
import type {
  Partner,
  PartnerCreateInput,
  PartnerUpdateInput,
  PartnerStatus,
} from "@/types/partner.types";

type PartnerRow = {
  id: string;
  name: string;
  logo: string;
  website_url: string | null;
  status: PartnerStatus;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

function mapRow(row: PartnerRow): Partner {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo,
    websiteUrl: row.website_url,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getAllPartners(limit = 500): Promise<Partner[]> {
  const idRows = await query<{ id: string }>(
    `SELECT id
     FROM partners FORCE INDEX (idx_partners_sort_updated)
     ORDER BY sort_order, updated_at DESC
     LIMIT ?`,
    [limit],
  );

  if (!idRows.length) return [];

  const ids = idRows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(",");
  const rows = await query<PartnerRow>(
    `SELECT id, name, logo, website_url, status, sort_order, created_at, updated_at
     FROM partners
     WHERE id IN (${placeholders})`,
    ids,
  );

  const rowMap = new Map(rows.map((row) => [row.id, row]));
  return idRows
    .map(({ id }) => rowMap.get(id))
    .filter(Boolean)
    .map((row) => mapRow(row as PartnerRow));
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  const row = await queryOne<PartnerRow>(
    `SELECT id, name, logo, website_url, status, sort_order, created_at, updated_at
     FROM partners
     WHERE id = ?`,
    [id],
  );

  return row ? mapRow(row) : null;
}

export async function getPublishedPartners(limit = 200): Promise<Partner[]> {
  const idRows = await query<{ id: string }>(
    `SELECT id
     FROM partners FORCE INDEX (idx_partners_status_order_updated)
     WHERE status = 'published'
     ORDER BY sort_order, updated_at DESC
     LIMIT ?`,
    [limit],
  );

  if (!idRows.length) return [];

  const ids = idRows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(",");
  const rows = await query<PartnerRow>(
    `SELECT id, name, logo, website_url, status, sort_order, created_at, updated_at
     FROM partners
     WHERE id IN (${placeholders})`,
    ids,
  );

  const rowMap = new Map(rows.map((row) => [row.id, row]));
  return idRows
    .map(({ id }) => rowMap.get(id))
    .filter(Boolean)
    .map((row) => mapRow(row as PartnerRow));
}

export async function createPartner(
  input: PartnerCreateInput,
): Promise<Partner> {
  const id = uuidv4();
  const now = new Date();

  await insert(
    `INSERT INTO partners
     (id, name, logo, website_url, status, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.logo,
      input.websiteUrl ?? null,
      input.status ?? "draft",
      input.sortOrder ?? 0,
      now,
      now,
    ],
  );

  const row: PartnerRow = {
    id,
    name: input.name,
    logo: input.logo,
    website_url: input.websiteUrl ?? null,
    status: input.status ?? "draft",
    sort_order: input.sortOrder ?? 0,
    created_at: now,
    updated_at: now,
  };

  return mapRow(row);
}

export async function updatePartner(
  input: PartnerUpdateInput,
): Promise<Partner | null> {
  const existing = await getPartnerById(input.id);
  if (!existing) return null;

  const merged: Partner = {
    ...existing,
    name: input.name ?? existing.name,
    logo: input.logo ?? existing.logo,
    websiteUrl:
      input.websiteUrl !== undefined ? input.websiteUrl : existing.websiteUrl,
    status: input.status ?? existing.status,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    updatedAt: new Date().toISOString(),
  };

  await updateQuery(
    `UPDATE partners SET
      name = ?, logo = ?, website_url = ?, status = ?, sort_order = ?, updated_at = ?
     WHERE id = ?`,
    [
      merged.name,
      merged.logo,
      merged.websiteUrl,
      merged.status,
      merged.sortOrder,
      new Date(),
      merged.id,
    ],
  );

  return merged;
}

export async function deletePartner(id: string): Promise<boolean> {
  const affected = await updateQuery(`DELETE FROM partners WHERE id = ?`, [id]);
  return affected > 0;
}

export async function getPartnersCount(): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM partners`,
  );
  return row?.count ?? 0;
}
