/**
 * User Model with Zod Validation
 */

import { z } from 'zod';
import type { User, UserCreateInput, UserUpdateInput, UserRole, Permission } from '@/types/admin.types';

// Permission enum schema
const PermissionSchema = z.enum([
  'videos.view',
  'videos.create',
  'videos.edit',
  'videos.delete',
  'videos.publish',
  'categories.manage',
  'broadcasts.manage',
  'partners.manage',
  'media.view',
  'media.upload',
  'media.delete',
  'users.view',
  'users.manage',
  'settings.view',
  'settings.edit'
]);

// User role schema
const UserRoleSchema = z.enum(['admin', 'editor', 'author']);

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().nullable(),
  role: UserRoleSchema,
  password: z.string(), // Already hashed
  isActive: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  permissions: z.array(PermissionSchema)
});

// User create validation schema
export const UserCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: UserRoleSchema.optional().default('author'),
  avatar: z.string().url().nullable().optional(),
  permissions: z.array(PermissionSchema).optional()
});

// User update validation schema
export const UserUpdateSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  avatar: z.string().url().nullable().optional(),
  role: UserRoleSchema.optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(PermissionSchema).optional()
});

// Password update schema
export const UserPasswordUpdateSchema = z.object({
  id: z.string().uuid(),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

// Admin password reset schema (no current password required)
export const UserAdminPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Login schema
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Type exports
export type UserSchemaType = z.infer<typeof UserSchema>;
export type UserCreateSchemaType = z.infer<typeof UserCreateSchema>;
export type UserUpdateSchemaType = z.infer<typeof UserUpdateSchema>;
export type UserPasswordUpdateSchemaType = z.infer<typeof UserPasswordUpdateSchema>;
export type UserAdminPasswordSchemaType = z.infer<typeof UserAdminPasswordSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;
