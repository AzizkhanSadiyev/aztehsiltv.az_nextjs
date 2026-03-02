/**
 * Partner Model with Zod Validation
 */

import { z } from "zod";
import type { PartnerStatus } from "@/types/partner.types";

const PartnerStatusSchema = z.enum(["draft", "published"]);

const normalizeWebsiteUrl = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

export const PartnerCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo: z.string().min(1, "Logo URL is required"),
  websiteUrl: z.preprocess(
    normalizeWebsiteUrl,
    z.string().url("Website URL must be a valid URL").nullable().optional(),
  ),
  status: PartnerStatusSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const PartnerUpdateSchema = PartnerCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export type PartnerCreateSchemaType = z.infer<typeof PartnerCreateSchema>;
export type PartnerUpdateSchemaType = z.infer<typeof PartnerUpdateSchema>;
export type PartnerStatusSchemaType = PartnerStatus;
