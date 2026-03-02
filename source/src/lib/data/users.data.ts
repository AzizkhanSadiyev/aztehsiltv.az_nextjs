/**
 * Users Data Access Layer (MySQL)
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import type {
  User,
  UserCreateInput,
  UserUpdateInput,
  UserPasswordUpdateInput,
  Permission,
  UserRole,
} from '@/types/admin.types';
import { rolePermissions } from '@/types/admin.types';
import { query, queryOne, insert, update as updateQuery } from '@/lib/db';

type UserRow = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  password: string;
  is_active: number;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  permissions: string | null;
};

const FALLBACK_USERS_PATH = path.join(process.cwd(), 'data', 'users.json');
const allowFallback =
  process.env.AUTH_ALLOW_FILE_FALLBACK
    ? process.env.AUTH_ALLOW_FILE_FALLBACK === 'true'
    : process.env.NODE_ENV !== 'production';

const toIsoString = (value: Date | string | null | undefined): string | null => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

const resolvePermissions = (
  role: UserRole,
  provided?: Permission[] | null,
): Permission[] => {
  if (role === 'admin') {
    return [...rolePermissions.admin];
  }
  if (provided && provided.length) {
    return [...provided];
  }
  return [...rolePermissions[role]];
};

function mapRowToUser(row: UserRow): User {
  const role = (row.role || 'author') as UserRole;

  const parsePermissions = (raw: unknown): Permission[] => {
    if (!raw) return [];

    // Already an array (e.g., MySQL JSON column parsed automatically)
    if (Array.isArray(raw)) {
      return raw.filter((p) => typeof p === 'string') as Permission[];
    }

    // Buffer or other binary types -> try toString
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(raw)) {
      return parsePermissions(raw.toString('utf8'));
    }

    // Strings (common case: JSON string or CSV)
    if (typeof raw === 'string') {
      // Try JSON first
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => typeof p === 'string') as Permission[];
        }
      } catch {
        /* ignore, will try CSV parsing below */
      }

      const csv = raw.split(',').map((p) => p.trim()).filter(Boolean);
      if (csv.length) return csv as Permission[];
      return [];
    }

    // Unknown shape: log once and fall back to role defaults later
    console.warn('Unrecognized permissions format for user', row.id, typeof raw);
    return [];
  };

  const parsedPermissions = parsePermissions(row.permissions);
  const permissions = resolvePermissions(role, parsedPermissions);

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar,
    role: row.role as User['role'],
    password: row.password,
    isActive: Boolean(row.is_active),
    lastLoginAt: toIsoString(row.last_login_at),
    createdAt: toIsoString(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date().toISOString(),
    permissions,
  };
}

function withoutPassword(user: User): Omit<User, 'password'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
}

export async function getFallbackUserByEmail(email: string): Promise<User | null> {
  if (!allowFallback) return null;
  try {
    const file = await fs.readFile(FALLBACK_USERS_PATH, 'utf-8');
    const users = JSON.parse(file) as User[];
    const normalized = email.trim().toLowerCase();
    const found = users.find(
      (u) => u.email.toLowerCase() === normalized && u.isActive !== false,
    );
    return found ?? null;
  } catch (err) {
    console.warn('Fallback users file not available:', err);
    return null;
  }
}

async function tryEnsureDefaultAdmin(): Promise<void> {
  if (!allowFallback) return;
  // If the database is reachable but empty, make sure the default admin exists.
  // We keep this lightweight and swallow errors to avoid blocking auth.
  try {
    const existing = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM users`,
    );
    if (existing?.count && existing.count > 0) return;

    // Seed default admin from fallback file if present
    const fallback = await getFallbackUserByEmail('admin@aztehsiltv.az');
    if (!fallback) return;

    await insert(
      `INSERT INTO users (id, email, name, avatar, role, password, is_active, last_login_at, created_at, updated_at, permissions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fallback.id,
        fallback.email,
        fallback.name,
        fallback.avatar,
        fallback.role,
        fallback.password,
        1,
        null,
        fallback.createdAt ? new Date(fallback.createdAt) : new Date(),
        fallback.updatedAt ? new Date(fallback.updatedAt) : new Date(),
        JSON.stringify(fallback.permissions || []),
      ],
    );
    console.log('Seeded default admin into users table from fallback file');
  } catch (err) {
    console.warn('Could not ensure default admin in database:', err);
  }
}

async function loadFallbackUsers(): Promise<User[]> {
  if (!allowFallback) return [];
  try {
    const file = await fs.readFile(FALLBACK_USERS_PATH, 'utf-8');
    const users = JSON.parse(file) as User[];
    return users;
  } catch (err) {
    console.warn('Fallback users file not available:', err);
    return [];
  }
}

async function saveFallbackUsers(users: User[]): Promise<void> {
  if (!allowFallback) return;
  await fs.writeFile(FALLBACK_USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  try {
    const rows = await query<UserRow>(
      `SELECT id, email, name, avatar, role, password, is_active, last_login_at, created_at, updated_at, permissions
       FROM users
       ORDER BY created_at DESC`
    );
    return rows.map((row) => withoutPassword(mapRowToUser(row)));
  } catch (err: any) {
    if (allowFallback) {
      console.warn('DB error in getAllUsers, using fallback file:', err?.code || err);
      const users = await loadFallbackUsers();
      return users.map(withoutPassword);
    }
    throw err;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<Omit<User, 'password'> | null> {
  try {
    const row = await queryOne<UserRow>(
      `SELECT id, email, name, avatar, role, password, is_active, last_login_at, created_at, updated_at, permissions
       FROM users
       WHERE id = ?`,
      [id]
    );
    return row ? withoutPassword(mapRowToUser(row)) : null;
  } catch (err: any) {
    if (allowFallback) {
      console.warn('DB error in getUserById, using fallback file:', err?.code || err);
      const users = await loadFallbackUsers();
      const found = users.find((u) => u.id === id);
      return found ? withoutPassword(found) : null;
    }
    throw err;
  }
}

/**
 * Get user by email (includes password for authentication)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  try {
    const row = await queryOne<UserRow>(
      `SELECT id, email, name, avatar, role, password, is_active, last_login_at, created_at, updated_at, permissions
       FROM users
       WHERE LOWER(email) = LOWER(?)`,
      [normalized],
    );

    if (row) return mapRowToUser(row);

    // If DB is reachable but user missing, attempt to seed default admin once (only when fallback allowed).
    await tryEnsureDefaultAdmin();
    const seededRow = await queryOne<UserRow>(
      `SELECT id, email, name, avatar, role, password, is_active, last_login_at, created_at, updated_at, permissions
       FROM users
       WHERE LOWER(email) = LOWER(?)`,
      [normalized],
    );
    if (seededRow) return mapRowToUser(seededRow);
  } catch (error: any) {
    // If DB is unreachable (e.g., ECONNREFUSED), fall back to local JSON users.
    const code = error?.code || '';
    if (code) {
      console.warn('DB error in getUserByEmail, falling back to file:', code);
    } else {
      console.warn('DB error in getUserByEmail, falling back to file:', error);
    }
    const fallback = await getFallbackUserByEmail(normalized);
    if (fallback) return fallback;
  }

  return null;
}

/**
 * Create new user
 */
export async function createUser(input: UserCreateInput): Promise<Omit<User, 'password'>> {
  const id = uuidv4();
  const now = new Date();

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const role: UserRole = input.role || 'author';
  const permissions = resolvePermissions(role, input.permissions ?? null);

  await insert(
    `INSERT INTO users (id, email, name, avatar, role, password, is_active, last_login_at, created_at, updated_at, permissions)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.email,
      input.name,
      input.avatar ?? null,
      role,
      hashedPassword,
      1,
      null,
      now,
      now,
      JSON.stringify(permissions),
    ]
  );

  return {
    id,
    email: input.email,
    name: input.name,
    avatar: input.avatar ?? null,
    role,
    isActive: true,
    lastLoginAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    permissions,
  };
}

/**
 * Update user
 */
export async function updateUser(
  input: UserUpdateInput
): Promise<Omit<User, 'password'> | null> {
  const existingRow = await queryOne<UserRow>(
    `SELECT id, email, name, avatar, role, password, is_active, last_login_at, created_at, updated_at, permissions
     FROM users
     WHERE id = ?`,
    [input.id]
  );

  if (!existingRow) return null;

  const fields: string[] = [];
  const params: any[] = [];

  if (input.email !== undefined) {
    fields.push('email = ?');
    params.push(input.email);
  }
  if (input.name !== undefined) {
    fields.push('name = ?');
    params.push(input.name);
  }
  if (input.avatar !== undefined) {
    fields.push('avatar = ?');
    params.push(input.avatar);
  }
  if (input.role !== undefined) {
    fields.push('role = ?');
    params.push(input.role);
  }
  if (input.isActive !== undefined) {
    fields.push('is_active = ?');
    params.push(input.isActive ? 1 : 0);
  }
  const nextRole = (input.role ?? existingRow.role ?? 'author') as UserRole;
  const shouldUpdatePermissions =
    input.permissions !== undefined || input.role !== undefined || nextRole === 'admin';
  if (shouldUpdatePermissions) {
    const resolvedPermissions = resolvePermissions(nextRole, input.permissions ?? null);
    fields.push('permissions = ?');
    params.push(JSON.stringify(resolvedPermissions));
  }

  fields.push('updated_at = ?');
  params.push(new Date());
  params.push(input.id);

  if (fields.length > 1) {
    await updateQuery(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = ?`,
      params
    );
  }

  const mergedUser = mapRowToUser({
    ...existingRow,
    email: input.email ?? existingRow.email,
    name: input.name ?? existingRow.name,
    avatar: input.avatar ?? existingRow.avatar,
    role: nextRole,
    is_active: input.isActive !== undefined ? (input.isActive ? 1 : 0) : existingRow.is_active,
    permissions: shouldUpdatePermissions
      ? JSON.stringify(resolvePermissions(nextRole, input.permissions ?? null))
      : existingRow.permissions,
    updated_at: new Date(),
  });

  return withoutPassword(mergedUser);
}

/**
 * Update user password
 */
export async function updateUserPassword(input: UserPasswordUpdateInput): Promise<boolean> {
  const row = await queryOne<{ id: string; password: string }>(
    `SELECT id, password FROM users WHERE id = ?`,
    [input.id]
  );

  if (!row) {
    throw new Error('User not found');
  }

  const isValid = await bcrypt.compare(input.currentPassword, row.password);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, 10);
  await updateQuery(
    `UPDATE users SET password = ?, updated_at = ? WHERE id = ?`,
    [hashedPassword, new Date(), input.id]
  );
  return true;
}

/**
 * Admin reset user password (no current password required)
 */
export async function setUserPassword(
  id: string,
  newPassword: string
): Promise<boolean> {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const affected = await updateQuery(
      `UPDATE users SET password = ?, updated_at = ? WHERE id = ?`,
      [hashedPassword, new Date(), id]
    );
    if (affected > 0) return true;
  } catch (err: any) {
    if (!allowFallback) throw err;
    console.warn('DB error in setUserPassword, attempting fallback update:', err?.code || err);
  }

  if (allowFallback) {
    const users = await loadFallbackUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      } as User;
      await saveFallbackUsers(users);
      return true;
    }
  }

  return false;
}

/**
 * Update last login time
 */
export async function updateLastLogin(id: string): Promise<void> {
  await updateQuery(
    `UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?`,
    [new Date(), new Date(), id]
  );
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const affected = await updateQuery(`DELETE FROM users WHERE id = ?`, [id]);
    if (affected > 0) return true;
  } catch (err: any) {
    if (!allowFallback) throw err;
    console.warn('DB error in deleteUser, attempting fallback delete:', err?.code || err);
  }

  if (allowFallback) {
    const users = await loadFallbackUsers();
    const next = users.filter((u) => u.id !== id);
    if (next.length !== users.length) {
      await saveFallbackUsers(next);
      return true;
    }
  }

  return false;
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM users WHERE LOWER(email) = LOWER(?)`,
    [email.trim().toLowerCase()]
  );
  return !!row;
}

/**
 * Get active users count
 */
export async function getActiveUsersCount(): Promise<number> {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM users WHERE is_active = 1`
  );
  return row?.count || 0;
}
