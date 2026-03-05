import type { LocalizedString } from "@/types/admin.types";

export interface Translation {
  id: string;
  key: string;
  values: LocalizedString;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TranslationCreateInput {
  key: string;
  values: LocalizedString;
  description?: string | null;
}

export interface TranslationUpdateInput {
  id: string;
  key?: string;
  values?: LocalizedString;
  description?: string | null;
}
