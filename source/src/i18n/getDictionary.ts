import { locales, defaultLocale, type Locale } from './config';

const dictionaries = {
  az: () => import('./dictionaries/az.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  ru: () => import('./dictionaries/ru.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  const normalized = (locale || defaultLocale).toLowerCase();
  const key = locales.includes(normalized as (typeof locales)[number])
    ? (normalized as (typeof locales)[number])
    : defaultLocale;
  return dictionaries[key]();
};
