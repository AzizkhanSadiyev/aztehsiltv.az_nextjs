/**
 * Video Model with Zod Validation
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

export const VideoSchema = z.object({
  id: z.string().uuid(),
  title: LocalizedStringSchema,
  slug: LocalizedStringSchema,
  description: LocalizedStringSchema.nullable(),
  coverUrl: z.string().nullable(),
  categoryId: z.string().uuid().nullable(),
  broadcastId: z.string().uuid().nullable(),
  type: z.enum(["video", "list"]),
  duration: z.string().nullable(),
  views: z.number().int().nonnegative(),
  status: z.enum(["draft", "published"]),
  isManshet: z.boolean(),
  isShort: z.boolean(),
  isSidebar: z.boolean(),
  isTopVideo: z.boolean(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.any()).nullable().optional(),
});

export const VideoCreateSchema = z.object({
  title: LocalizedStringRequiredInputSchema,
  slug: LocalizedStringInputSchema.optional(),
  description: LocalizedStringOptionalInputSchema.optional(),
  coverUrl: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  broadcastId: z.string().uuid().nullable().optional(),
  type: z.enum(["video", "list"]).optional().default("video"),
  duration: z.string().nullable().optional(),
  views: z.number().int().nonnegative().optional().default(0),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  isManshet: z.boolean().optional().default(false),
  isShort: z.boolean().optional().default(false),
  isSidebar: z.boolean().optional().default(false),
  isTopVideo: z.boolean().optional().default(false),
  publishedAt: z.string().datetime().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

export const VideoUpdateSchema = z.object({
  id: z.string().uuid(),
  title: LocalizedStringInputSchema.optional(),
  slug: LocalizedStringInputSchema.optional(),
  description: LocalizedStringOptionalInputSchema.optional(),
  coverUrl: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  broadcastId: z.string().uuid().nullable().optional(),
  type: z.enum(["video", "list"]).optional(),
  duration: z.string().nullable().optional(),
  views: z.number().int().nonnegative().optional(),
  status: z.enum(["draft", "published"]).optional(),
  isManshet: z.boolean().optional(),
  isShort: z.boolean().optional(),
  isSidebar: z.boolean().optional(),
  isTopVideo: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

export type VideoSchemaType = z.infer<typeof VideoSchema>;
export type VideoCreateSchemaType = z.infer<typeof VideoCreateSchema>;
export type VideoUpdateSchemaType = z.infer<typeof VideoUpdateSchema>;
