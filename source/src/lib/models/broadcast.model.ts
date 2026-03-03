/**
 * Broadcast Model with Zod Validation
 */

import { z } from "zod";
import { defaultLocale } from "@/i18n/config";

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
