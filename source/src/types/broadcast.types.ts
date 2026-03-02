/**
 * Broadcast Types
 * Content model for broadcast / playlist sections
 */

import type { LocalizedString } from "./admin.types";

export type BroadcastStatus = "draft" | "published";

export interface Broadcast {
  id: string;
  title: LocalizedString;
  slug: LocalizedString;
  description: LocalizedString | null;
  imageUrl: string;
  status: BroadcastStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastCreateInput {
  title: LocalizedString;
  slug?: LocalizedString;
  description?: LocalizedString | null;
  imageUrl: string;
  status?: BroadcastStatus;
  sortOrder?: number;
}

export interface BroadcastUpdateInput extends Partial<BroadcastCreateInput> {
  id: string;
}
