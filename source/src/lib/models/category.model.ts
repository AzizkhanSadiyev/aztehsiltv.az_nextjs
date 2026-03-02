/**
 * Category Model with Zod Validation
 */

import { z } from 'zod';

// Localized string schemas
const LocalizedStringSchema = z.object({
  az: z.string(),
  en: z.string(),
  ru: z.string()
});

const LocalizedStringRequiredSchema = z.object({
  az: z.string().min(1, 'Azerbaijani name is required'),
  en: z.string().min(1, 'English name is required'),
  ru: z.string().min(1, 'Russian name is required')
});

const toLocalizedString = (value: string) => ({
  az: value,
  en: value,
  ru: value
});

const LocalizedStringInputSchema = z
  .union([LocalizedStringSchema, z.string().min(1)])
  .transform((value) => (typeof value === 'string' ? toLocalizedString(value) : value));

const LocalizedStringRequiredInputSchema = z
  .union([LocalizedStringRequiredSchema, z.string().min(1)])
  .transform((value) => (typeof value === 'string' ? toLocalizedString(value) : value));

const LocalizedStringOptionalInputSchema = z
  .union([LocalizedStringSchema, z.string(), z.null()])
  .transform((value) => {
    if (value === null) return null;
    if (typeof value === 'string') return toLocalizedString(value);
    return value;
  });

// Position schema (1 = header, 2 = footer)
const PositionValueSchema = z.union([z.literal(1), z.literal(2)]);
const PositionsArraySchema = z.array(PositionValueSchema).default([]);

// Category schema
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: LocalizedStringSchema,
  slug: LocalizedStringSchema,
  description: LocalizedStringSchema.nullable(),
  parentId: z.string().uuid().nullable(),
  icon: z.string().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  order: z.number().int().nonnegative(),
  positions: PositionsArraySchema,
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Category create validation schema
export const CategoryCreateSchema = z.object({
  name: LocalizedStringRequiredInputSchema,
  slug: LocalizedStringInputSchema.optional(),
  description: LocalizedStringOptionalInputSchema.optional(),
  parentId: z.string().uuid().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional().default('#6366f1'),
  order: z.number().int().nonnegative().optional().default(0),
  positions: PositionsArraySchema.optional()
});

// Category update validation schema
export const CategoryUpdateSchema = z.object({
  id: z.string().uuid(),
  name: LocalizedStringInputSchema.optional(),
  slug: LocalizedStringInputSchema.optional(),
  description: LocalizedStringOptionalInputSchema.optional(),
  parentId: z.string().uuid().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  order: z.number().int().nonnegative().optional(),
  positions: PositionsArraySchema.optional(),
  isActive: z.boolean().optional()
});

// Type exports
export type CategorySchemaType = z.infer<typeof CategorySchema>;
export type CategoryCreateSchemaType = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateSchemaType = z.infer<typeof CategoryUpdateSchema>;
