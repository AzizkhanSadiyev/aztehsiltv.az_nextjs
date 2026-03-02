/**
 * Broadcast Model with Zod Validation
 */

import { z } from "zod";

const LocalizedStringSchema = z.object({
  az: z.string(),
  en: z.string(),
  ru: z.string(),
});

const LocalizedStringRequiredSchema = z.object({
  az: z.string().min(1, "Azerbaijani title is required"),
  en: z.string().min(1, "English title is required"),
  ru: z.string().min(1, "Russian title is required"),
});

const toLocalizedString = (value: string) => ({
  az: value,
  en: value,
  ru: value,
});

const LocalizedStringInputSchema = z
  .union([LocalizedStringSchema, z.string().min(1)])
  .transform((value) =>
    typeof value === "string" ? toLocalizedString(value) : value,
  );

const LocalizedStringRequiredInputSchema = z
  .union([LocalizedStringRequiredSchema, z.string().min(1)])
  .transform((value) =>
    typeof value === "string" ? toLocalizedString(value) : value,
  );

const LocalizedStringOptionalInputSchema = z
  .union([LocalizedStringSchema, z.string(), z.null()])
  .transform((value) => {
    if (value === null) return null;
    if (typeof value === "string") return toLocalizedString(value);
    return value;
  });

export const BroadcastSchema = z.object({
  id: z.string().uuid(),
  title: LocalizedStringSchema,
  slug: LocalizedStringSchema,
  description: LocalizedStringSchema.nullable(),
  imageUrl: z.string(),
  status: z.enum(["draft", "published"]),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const BroadcastCreateSchema = z.object({
  title: LocalizedStringRequiredInputSchema,
  slug: LocalizedStringInputSchema.optional(),
  description: LocalizedStringOptionalInputSchema.optional(),
  imageUrl: z.string().min(1, "Image URL is required"),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  sortOrder: z.number().int().nonnegative().optional().default(0),
});

export const BroadcastUpdateSchema = z.object({
  id: z.string().uuid(),
  title: LocalizedStringInputSchema.optional(),
  slug: LocalizedStringInputSchema.optional(),
  description: LocalizedStringOptionalInputSchema.optional(),
  imageUrl: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type BroadcastSchemaType = z.infer<typeof BroadcastSchema>;
export type BroadcastCreateSchemaType = z.infer<typeof BroadcastCreateSchema>;
export type BroadcastUpdateSchemaType = z.infer<typeof BroadcastUpdateSchema>;
