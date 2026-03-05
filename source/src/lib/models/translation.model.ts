/**
 * Translation Model with Zod Validation
 */

import { z } from "zod";
import { defaultLocale } from "@/i18n/config";

const hasLocales = (value: Record<string, string>) =>
  Object.values(value).some((entry) => entry.trim().length > 0);

const TranslationValuesSchema = z
  .record(z.string())
  .refine(hasLocales, { message: "At least one locale value is required" });

const toLocalizedString = (value: string) => ({
  [defaultLocale]: value,
});

const TranslationValuesInputSchema = z
  .union([TranslationValuesSchema, z.string().min(1)])
  .transform((value) => (typeof value === "string" ? toLocalizedString(value) : value));

const TranslationKeySchema = z
  .string()
  .min(1)
  .max(255)
  .regex(
    /^[A-Za-z0-9_.-]+$/,
    "Key can only contain letters, numbers, '.', '_' or '-'",
  );

export const TranslationSchema = z.object({
  id: z.string().uuid(),
  key: TranslationKeySchema,
  values: TranslationValuesSchema,
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const TranslationCreateSchema = z.object({
  key: TranslationKeySchema,
  values: TranslationValuesInputSchema,
  description: z.string().nullable().optional(),
});

export const TranslationUpdateSchema = z.object({
  id: z.string().uuid(),
  key: TranslationKeySchema.optional(),
  values: TranslationValuesInputSchema.optional(),
  description: z.string().nullable().optional(),
});

export type TranslationSchemaType = z.infer<typeof TranslationSchema>;
export type TranslationCreateSchemaType = z.infer<typeof TranslationCreateSchema>;
export type TranslationUpdateSchemaType = z.infer<typeof TranslationUpdateSchema>;
