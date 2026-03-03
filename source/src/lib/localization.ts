import type { LocalizedString } from "@/types/admin.types";

const LOCALE_KEY_REGEX = /^[A-Za-z0-9_-]+$/;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

export const normalizeLocalized = (value: unknown): LocalizedString => {
  let raw: unknown = value;

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return {};
    }
  }

  if (!isPlainObject(raw)) return {};

  const result: LocalizedString = {};
  for (const [key, entry] of Object.entries(raw)) {
    if (typeof entry === "string") {
      result[key] = entry;
    }
  }

  return result;
};

export const normalizeLocalizedNullable = (
  value: unknown,
): LocalizedString | null => {
  const normalized = normalizeLocalized(value);
  return Object.keys(normalized).length > 0 ? normalized : null;
};

export const toJsonOrNull = (
  value: LocalizedString | null | undefined,
): string | null => {
  if (!value) return null;
  const normalized = normalizeLocalized(value);
  if (Object.keys(normalized).length === 0) return null;
  return JSON.stringify(normalized);
};

export const mergeLocalized = (
  base: LocalizedString,
  update?: LocalizedString | null,
): LocalizedString => {
  if (!update) return { ...base };
  const normalized = normalizeLocalized(update);
  return { ...base, ...normalized };
};

export const buildSlugMap = (
  value: LocalizedString,
  slugify: (input: string) => string,
): LocalizedString => {
  const result: LocalizedString = {};
  for (const [locale, text] of Object.entries(value || {})) {
    if (typeof text === "string" && text.trim().length > 0) {
      result[locale] = slugify(text);
    }
  }
  return result;
};

export const safeLocaleKey = (value: string, fallback: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  return LOCALE_KEY_REGEX.test(trimmed) ? trimmed : fallback;
};

export const jsonPathForLocale = (
  locale: string,
  fallback: string,
): string => {
  const safe = safeLocaleKey(locale, fallback);
  return `$."${safe}"`;
};

export const pickLocalized = (
  value: LocalizedString | null | undefined,
  locale: string,
  fallbackLocale: string,
): string => {
  if (!value) return "";
  const safeLocale = safeLocaleKey(locale, fallbackLocale);
  if (value[safeLocale]) return value[safeLocale];
  if (value[fallbackLocale]) return value[fallbackLocale];
  const first = Object.values(value).find(
    (entry) => typeof entry === "string" && entry.trim().length > 0,
  );
  return typeof first === "string" ? first : "";
};
