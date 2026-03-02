/**
 * Core Admin Types
 * User, Role, and Permission types for the admin panel
 */

export type Locale = 'az' | 'en' | 'ru';

export interface LocalizedString {
  az: string;
  en: string;
  ru: string;
}

export type UserRole = 'admin' | 'editor' | 'author';

export type Permission = 
  | 'videos.view'
  | 'videos.create'
  | 'videos.edit'
  | 'videos.delete'
  | 'videos.publish'
  | 'categories.manage'
  | 'broadcasts.manage'
  | 'partners.manage'
  | 'media.view'
  | 'media.upload'
  | 'media.delete'
  | 'users.view'
  | 'users.manage'
  | 'settings.view'
  | 'settings.edit';

/**
 * User entity for admin panel
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  password: string; // bcrypt hashed
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
  avatar?: string | null;
  permissions?: Permission[];
}

export interface UserUpdateInput {
  id: string;
  email?: string;
  name?: string;
  avatar?: string | null;
  role?: UserRole;
  isActive?: boolean;
  permissions?: Permission[];
}

export interface UserPasswordUpdateInput {
  id: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * Role-based permission mappings
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'videos.view', 'videos.create', 'videos.edit', 'videos.delete', 'videos.publish',
    'categories.manage', 'broadcasts.manage', 'partners.manage',
    'media.view', 'media.upload', 'media.delete',
    'users.view', 'users.manage', 'settings.view', 'settings.edit'
  ],
  editor: [
    'videos.view', 'videos.create', 'videos.edit', 'videos.publish',
    'categories.manage', 'broadcasts.manage', 'partners.manage',
    'media.view', 'media.upload'
  ],
  author: [
    'videos.view', 'videos.create', 'videos.edit',
    'media.view', 'media.upload'
  ]
};
