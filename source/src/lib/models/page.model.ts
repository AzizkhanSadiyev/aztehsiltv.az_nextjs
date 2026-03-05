import { z } from "zod";

const LocalizedStringSchema = z.record(z.string());

export const PageCreateSchema = z.object({
  slug: z.string().optional(),
  title: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const PageUpdateSchema = PageCreateSchema.partial().extend({
  id: z.string(),
});

export type PageCreateInput = z.infer<typeof PageCreateSchema>;
export type PageUpdateInput = z.infer<typeof PageUpdateSchema>;
