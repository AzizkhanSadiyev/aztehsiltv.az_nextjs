/**
 * Media Types
 * Types for media/file management
 */

import { LocalizedString } from './admin.types';

export type MediaType = 'image' | 'video' | 'document' | 'other';

export interface Media {
  id: string;
  filename: string;
  url: string;
  path: string;
  mimeType: string;
  type: MediaType;
  size: number; // bytes
  width: number | null;
  height: number | null;
  alt: LocalizedString | null;
  title: LocalizedString | null;
  uploadedBy: string; // User ID
  uploadedAt: string;
  metadata: {
    dimensions?: string;
    format?: string;
    folder?: string;
    entity?: string;
    entitySlug?: string;
    field?: string;
    originalName?: string;
    tags?: string[];
  };
}

export interface MediaUploadInput {
  file: File;
  alt?: LocalizedString;
  title?: LocalizedString;
  folder?: string;
}

export interface MediaUpdateInput {
  id: string;
  alt?: LocalizedString;
  title?: LocalizedString;
  metadata?: Partial<Media['metadata']>;
}

export interface MediaFilters {
  type?: MediaType;
  folder?: string;
  search?: string;
}

/**
 * Helper function to determine media type from MIME type
 */
export function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.match(/^application\/(pdf|msword|vnd\.|text)/)) return 'document';
  return 'other';
}
