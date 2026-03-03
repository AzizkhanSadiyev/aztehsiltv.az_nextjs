/**
 * Language Types
 * Types for language management
 */

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageCreateInput {
  code: string;
  name: string;
  nativeName?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface LanguageUpdateInput extends Partial<LanguageCreateInput> {
  id: string;
}
