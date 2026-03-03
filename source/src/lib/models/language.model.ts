/**
 * Language Model with Zod Validation
 */

import { z } from "zod";

const LanguageCodeSchema = z
  .string()
  .min(2, "Code must be at least 2 characters")
  .max(10, "Code must be 10 characters or less")
  .regex(/^[A-Za-z0-9_-]+$/, "Code can only include letters, numbers, '-' or '_'")
  .transform((value) => value.toLowerCase());

export const LanguageSchema = z.object({
  id: z.string().uuid(),
  code: LanguageCodeSchema,
  name: z.string().min(1, "Name is required"),
  nativeName: z.string().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const LanguageCreateSchema = z.object({
  code: LanguageCodeSchema,
  name: z.string().min(1, "Name is required"),
  nativeName: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().nonnegative().optional().default(0),
});

export const LanguageUpdateSchema = z.object({
  id: z.string().uuid(),
  code: LanguageCodeSchema.optional(),
  name: z.string().min(1, "Name is required").optional(),
  nativeName: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type LanguageSchemaType = z.infer<typeof LanguageSchema>;
export type LanguageCreateSchemaType = z.infer<typeof LanguageCreateSchema>;
export type LanguageUpdateSchemaType = z.infer<typeof LanguageUpdateSchema>;
