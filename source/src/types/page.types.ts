import type { LocalizedString } from "@/types/admin.types";

export interface Page {
  id: string;
  slug: string;
  title: LocalizedString;
  description: LocalizedString | null;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface PageCreateInput {
  slug?: string;
  title: LocalizedString;
  description?: LocalizedString | null;
  status?: "draft" | "published";
}

export interface PageUpdateInput {
  id: string;
  slug?: string;
  title?: LocalizedString;
  description?: LocalizedString | null;
  status?: "draft" | "published";
}
