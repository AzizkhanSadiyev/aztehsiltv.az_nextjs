/**
 * Video Types
 * Content model for videos
 */

import type { LocalizedString } from "./admin.types";

export type VideoStatus = "draft" | "published";
export type VideoType = "video" | "list";

export interface Video {
  id: string;
  title: LocalizedString;
  slug: LocalizedString;
  description: LocalizedString | null;
  coverUrl: string | null;
  sourceUrl: string | null;
  categoryId: string | null;
  broadcastId: string | null;
  type: VideoType;
  duration: string | null;
  views: number;
  status: VideoStatus;
  isManshet: boolean;
  isShort: boolean;
  isSidebar: boolean;
  isTopVideo: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any> | null;
}

export interface VideoCreateInput {
  title: LocalizedString;
  slug?: LocalizedString;
  description?: LocalizedString | null;
  coverUrl?: string | null;
  sourceUrl?: string | null;
  categoryId?: string | null;
  broadcastId?: string | null;
  type?: VideoType;
  duration?: string | null;
  views?: number;
  status?: VideoStatus;
  isManshet?: boolean;
  isShort?: boolean;
  isSidebar?: boolean;
  isTopVideo?: boolean;
  publishedAt?: string | null;
  metadata?: Record<string, any> | null;
}

export interface VideoUpdateInput extends Partial<VideoCreateInput> {
  id: string;
}
