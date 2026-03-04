/**
 * Media Model with Zod Validation
 */

import { z } from "zod";
import type { Media, MediaUpdateInput } from '@/types/media.types';

// Localized string schema
const LocalizedStringSchema = z
  .record(z.string())
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one locale is required",
  });

// Media metadata schema
const MediaMetadataSchema = z.object({
  dimensions: z.string().optional(),
  format: z.string().optional(),
  folder: z.string().optional(),
  entity: z.string().optional(),
  entitySlug: z.string().optional(),
  field: z.string().optional(),
  originalName: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Media schema
export const MediaSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  url: z.string().url(),
  path: z.string(),
  mimeType: z.string(),
  type: z.enum(['image', 'video', 'document', 'other']),
  size: z.number().int().positive(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  alt: LocalizedStringSchema.nullable(),
  title: LocalizedStringSchema.nullable(),
  uploadedBy: z.string().uuid(),
  uploadedAt: z.string().datetime(),
  metadata: MediaMetadataSchema
});

// Media update validation schema
export const MediaUpdateSchema = z.object({
  id: z.string().uuid(),
  alt: LocalizedStringSchema.nullable().optional(),
  title: LocalizedStringSchema.nullable().optional(),
  metadata: MediaMetadataSchema.partial().optional()
});

// Media filters schema
export const MediaFiltersSchema = z.object({
  type: z.enum(['image', 'video', 'document', 'other']).optional(),
  folder: z.string().optional(),
  search: z.string().optional()
});

// Type exports
export type MediaSchemaType = z.infer<typeof MediaSchema>;
export type MediaUpdateSchemaType = z.infer<typeof MediaUpdateSchema>;
export type MediaFiltersSchemaType = z.infer<typeof MediaFiltersSchema>;
