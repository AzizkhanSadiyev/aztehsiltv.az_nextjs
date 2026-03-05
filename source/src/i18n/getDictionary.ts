import { locales, defaultLocale, type Locale } from './config';
import { getTranslationsForLocale } from "@/lib/data/translations.data";

const applyTranslations = (
  base: Record<string, any>,
  translations: Record<string, string>,
) => {
  const result = JSON.parse(JSON.stringify(base)) as Record<string, any>;
  Object.entries(translations).forEach(([key, value]) => {
    if (!key || !value) return;
    const parts = key.split(".").filter(Boolean);
    if (!parts.length) return;
    let target: Record<string, any> = result;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        target[part] = value;
        return;
      }
      if (!target[part] || typeof target[part] !== "object") {
        target[part] = {};
      }
      target = target[part];
    });
  });
  return result;
};

const dictionaries = {
  az: () => import('./dictionaries/az.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  ru: () => import('./dictionaries/ru.json').then((module) => module.default),
};

export const getDictionary = async (
  locale: Locale,
): Promise<Record<string, any>> => {
  const normalized = (locale || defaultLocale).toLowerCase();
  const key = locales.includes(normalized as (typeof locales)[number])
    ? (normalized as (typeof locales)[number])
    : defaultLocale;
  const baseDictionary = (await dictionaries[key]()) as Record<string, any>;
  try {
    const overrides = await getTranslationsForLocale(normalized, defaultLocale);
    return applyTranslations(baseDictionary as Record<string, any>, overrides);
  } catch {
    return baseDictionary;
  }
};
