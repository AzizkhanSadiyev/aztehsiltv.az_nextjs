/**
 * Site Settings Data Access Layer (MySQL)
 */

import { v4 as uuidv4 } from "uuid";
import { queryOne, insert, update as updateQuery } from "@/lib/db";
import type { SiteSettings } from "@/types/settings.types";
import { defaultLocale } from "@/i18n/config";

type SettingsRow = {
  id: string;
  settings_key: string;
  settings_value: any;
  created_at: Date;
  updated_at: Date;
};

const SETTINGS_KEY = "app";

const DEFAULT_SETTINGS: SiteSettings = {
  site: {
    name: {
      az: "Aztehsil TV",
      en: "Aztehsil TV",
      ru: "Aztehsil TV",
    },
    description: {
      az: "Education video portal",
      en: "Education video portal",
      ru: "Education video portal",
    },
    url: "",
  },
  menuLinks: [
    {
      id: "about",
      label: { az: "Haqqimizda", en: "About", ru: "About" },
      url: "#",
    },
    {
      id: "press",
      label: { az: "Press-relizler", en: "Press releases", ru: "Press" },
      url: "#",
    },
    {
      id: "ads",
      label: { az: "Saytda reklam", en: "Advertising", ru: "Advertising" },
      url: "#",
    },
    {
      id: "contact",
      label: { az: "Elaqe", en: "Contact", ru: "Contact" },
      url: "#",
    },
  ],
  contact: {
    email: "",
    phone: "",
    address: "",
  },
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
    telegram: "",
    tiktok: "",
  },
  footer: {
    copyright: {
      az: "© 2018 - 2026 AztehsilTV.az. All rights reserved.",
      en: "© 2018 - 2026 AztehsilTV.az. All rights reserved.",
      ru: "© 2018 - 2026 AztehsilTV.az. All rights reserved.",
    },
    poweredByLabel: "Powered by:",
    poweredByUrl: "https://coresoft.az/",
    poweredByLogoUrl: "/assets/icons/coresoft.svg",
  },
  seo: {
    defaultTitle: {
      az: "AztehsilTV.az",
      en: "AztehsilTV.az",
      ru: "AztehsilTV.az",
    },
    defaultDescription: {
      az: "Education video portal.",
      en: "Education video portal.",
      ru: "Education video portal.",
    },
  },
  analytics: {
    gaId: "",
    gtmId: "",
  },
  localization: {
    defaultLocale,
    supportedLocales: ["az", "en", "ru"],
    timezone: "Asia/Baku",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "HH:mm",
  },
  api: {
    cacheEnabled: false,
    cacheTtl: 300,
    rateLimitPerMinute: 100,
  },
};

const isPlainObject = (value: unknown): value is Record<string, any> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const parseJson = (value: unknown): any => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
};

const deepMerge = (base: any, update: any): any => {
  if (!isPlainObject(base)) {
    return update ?? base;
  }
  const result: Record<string, any> = { ...base };
  if (!isPlainObject(update)) {
    return result;
  }
  for (const [key, value] of Object.entries(update)) {
    if (value === undefined) continue;
    const current = result[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = deepMerge(current, value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

const normalizeSettings = (value: unknown): SiteSettings => {
  const parsed = parseJson(value);
  if (!isPlainObject(parsed)) {
    return DEFAULT_SETTINGS;
  }
  return deepMerge(DEFAULT_SETTINGS, parsed);
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await queryOne<SettingsRow>(
      `SELECT id, settings_key, settings_value, created_at, updated_at
       FROM settings
       WHERE settings_key = ?`,
      [SETTINGS_KEY],
    );

    if (!row) {
      return DEFAULT_SETTINGS;
    }

    return normalizeSettings(row.settings_value);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "ER_NO_SUCH_TABLE") {
      return DEFAULT_SETTINGS;
    }
    throw error;
  }
}

export async function updateSiteSettings(
  update: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const merged = deepMerge(current, update);
  if (Array.isArray(merged.menuLinks)) {
    merged.menuLinks = merged.menuLinks.map((link: any) => ({
      id: link?.id || uuidv4(),
      label: link?.label || {},
      url: link?.url || "",
    }));
  }
  const now = new Date();

  const row = await queryOne<SettingsRow>(
    `SELECT id FROM settings WHERE settings_key = ?`,
    [SETTINGS_KEY],
  );

  if (row) {
    await updateQuery(
      `UPDATE settings
       SET settings_value = ?, updated_at = ?
       WHERE settings_key = ?`,
      [JSON.stringify(merged), now, SETTINGS_KEY],
    );
  } else {
    await insert(
      `INSERT INTO settings
       (id, settings_key, settings_value, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), SETTINGS_KEY, JSON.stringify(merged), now, now],
    );
  }

  return merged;
}
