/**
 * Category Model with Zod Validation
 */

import { z } from "zod";
import { defaultLocale } from "@/i18n/config";

// Localized string schemas
const hasLocales = (value: Record<string, string>) =>
  Object.keys(value).length > 0;

const LocalizedStringSchema = z
  .record(z.string())
  .refine(hasLocales, { message: "At least one locale is required" });

const LocalizedStringRequiredSchema = z
  .record(z.string().min(1))
  .refine(hasLocales, { message: "At least one locale is required" });

const toLocalizedString = (value: string) => ({
  [defaultLocale]: value,
});

const LocalizedStringInputSchema = z
  .union([LocalizedStringSchema, z.string().min(1)])
  .transform((value) => (typeof value === "string" ? toLocalizedString(value) : value));

const LocalizedStringRequiredInputSchema = z
  .union([LocalizedStringRequiredSchema, z.string().min(1)])
  .transform((value) => (typeof value === "string" ? toLocalizedString(value) : value));

const LocalizedStringOptionalInputSchema = z
  .union([LocalizedStringSchema, z.string(), z.null()])
  .transform((value) => {
    if (value === null) return null;
    if (typeof value === "string") return toLocalizedString(value);
    return value;
  });

const SlugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens");

// Position schema (1 = header, 2 = footer)
const PositionValueSchema = z.union([z.literal(1), z.literal(2)]);
const PositionsArraySchema = z.array(PositionValueSchema).default([]);

// Category schema
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: LocalizedStringSchema,
  slug: SlugSchema,
  description: LocalizedStringSchema.nullable(),
  parentId: z.string().uuid().nullable(),
  icon: z.string().nullable(),
  coverUrl: z.string().nullable(),
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
  slug: SlugSchema.optional(),
  description: LocalizedStringOptionalInputSchema.optional(),
  parentId: z.string().uuid().nullable().optional(),
  icon: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional().default('#6366f1'),
  order: z.number().int().nonnegative().optional().default(0),
  positions: PositionsArraySchema.optional()
});

// Category update validation schema
export const CategoryUpdateSchema = z.object({
  id: z.string().uuid(),
  name: LocalizedStringInputSchema.optional(),
  slug: SlugSchema.optional(),
  description: LocalizedStringOptionalInputSchema.optional(),
  parentId: z.string().uuid().nullable().optional(),
  icon: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  order: z.number().int().nonnegative().optional(),
  positions: PositionsArraySchema.optional(),
  isActive: z.boolean().optional()
});

// Type exports
export type CategorySchemaType = z.infer<typeof CategorySchema>;
export type CategoryCreateSchemaType = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateSchemaType = z.infer<typeof CategoryUpdateSchema>;
