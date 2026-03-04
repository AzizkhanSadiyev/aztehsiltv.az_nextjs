import { z } from "zod";

const LocalizedStringSchema = z.record(z.string());

const SettingsLinkSchema = z.object({
  id: z.string().optional(),
  label: LocalizedStringSchema.optional(),
  url: z.string().optional(),
});

export const SettingsUpdateSchema = z
  .object({
    site: z
      .object({
        name: LocalizedStringSchema.optional(),
        description: LocalizedStringSchema.optional(),
        url: z.string().optional(),
      })
      .optional(),
    menuLinks: z.array(SettingsLinkSchema).optional(),
    contact: z
      .object({
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
      .optional(),
    social: z
      .object({
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        youtube: z.string().optional(),
        telegram: z.string().optional(),
        tiktok: z.string().optional(),
        whatsapp: z.string().optional(),
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        copyright: LocalizedStringSchema.optional(),
        poweredByLabel: z.string().optional(),
        poweredByUrl: z.string().optional(),
        poweredByLogoUrl: z.string().optional(),
      })
      .optional(),
    seo: z
      .object({
        defaultTitle: LocalizedStringSchema.optional(),
        defaultDescription: LocalizedStringSchema.optional(),
      })
      .optional(),
    analytics: z
      .object({
        gaId: z.string().optional(),
        gtmId: z.string().optional(),
      })
      .optional(),
    localization: z
      .object({
        defaultLocale: z.string().optional(),
        supportedLocales: z.array(z.string()).optional(),
        timezone: z.string().optional(),
        dateFormat: z.string().optional(),
        timeFormat: z.string().optional(),
      })
      .optional(),
    api: z
      .object({
        cacheEnabled: z.boolean().optional(),
        cacheTtl: z.number().optional(),
        rateLimitPerMinute: z.number().optional(),
      })
      .optional(),
  })
  .partial();

export type SettingsUpdateInput = z.infer<typeof SettingsUpdateSchema>;
