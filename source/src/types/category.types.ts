/**
 * Category Types
 * Types for category management
 */

import { LocalizedString } from './admin.types';

export interface Category {
  id: string;
  name: LocalizedString;
  slug: LocalizedString;
  description: LocalizedString | null;
  parentId: string | null;
  icon: string | null;
  color: string;
  order: number;
  positions: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateInput {
  name: LocalizedString;
  slug?: LocalizedString;
  description?: LocalizedString | null;
  parentId?: string | null;
  icon?: string | null;
  color?: string;
  order?: number;
  positions?: number[];
}

export interface CategoryUpdateInput extends Partial<CategoryCreateInput> {
  id: string;
  isActive?: boolean;
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  videoCount?: number;
}
