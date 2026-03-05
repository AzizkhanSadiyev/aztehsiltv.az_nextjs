import type { LocalizedString } from "@/types/admin.types";

export interface SettingsLink {
  id: string;
  label: LocalizedString;
  url: string;
}

export interface SettingsSocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  telegram?: string;
  tiktok?: string;
  whatsapp?: string;
  twitter?: string;
  linkedin?: string;
}

export interface SettingsSiteIdentity {
  name: LocalizedString;
  description: LocalizedString;
  url: string;
}

export interface SettingsContact {
  email: string;
  phone: string;
  address: string;
}

export interface SettingsFooter {
  copyright: LocalizedString;
  poweredByLabel: string;
  poweredByUrl: string;
  poweredByLogoUrl?: string;
}

export interface SettingsSeo {
  defaultTitle: LocalizedString;
  defaultDescription: LocalizedString;
  ogTitle: LocalizedString;
  ogDescription: LocalizedString;
  ogImageUrl?: string;
}

export interface SettingsAnalytics {
  gaId?: string;
  gtmId?: string;
}

export interface SettingsLocalization {
  defaultLocale: string;
  supportedLocales: string[];
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
}

export interface SettingsApi {
  cacheEnabled?: boolean;
  cacheTtl?: number;
  rateLimitPerMinute?: number;
}

export interface SiteSettings {
  site: SettingsSiteIdentity;
  menuLinks: SettingsLink[];
  contact: SettingsContact;
  social: SettingsSocialLinks;
  footer: SettingsFooter;
  seo: SettingsSeo;
  analytics: SettingsAnalytics;
  localization: SettingsLocalization;
  api: SettingsApi;
}
