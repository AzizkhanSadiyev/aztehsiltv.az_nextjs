/**
 * Categories API Route Handler
 * GET /api/categories - List all categories
 * POST /api/categories - Create new category
 */

export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import {
  successResponse,
  validateRequestBody,
  withErrorHandling
} from '@/lib/api-helpers';
import { getAllCategories, createCategory } from '@/lib/data/categories.data';
import { getVideoCountsByCategory } from '@/lib/data/videos.data';
import { CategoryCreateSchema } from '@/lib/models/category.model';
import type { Category } from '@/types/category.types';
import type { LocalizedString, Locale } from '@/types/admin.types';

const DEFAULT_LOCALE: Locale = 'az';
const isLocale = (value: string): value is Locale => value === 'az' || value === 'en' || value === 'ru';

function pickLocalized(value: LocalizedString, locale: string = DEFAULT_LOCALE) {
  const safeLocale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return value?.[safeLocale] || value?.az || value?.en || value?.ru || '';
}

function toAdminCategory(category: Category, locale: string = DEFAULT_LOCALE) {
  return {
    ...category,
    name: pickLocalized(category.name, locale),
    slug: pickLocalized(category.slug, locale),
    description: category.description ? pickLocalized(category.description, locale) : '',
    positions: category.positions || [],
    languageCode: locale
  };
}

/**
 * GET /api/categories
 * List all categories
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const categories = await getAllCategories();
    const locale = request.nextUrl.searchParams.get('lang') || DEFAULT_LOCALE;
    const counts = await getVideoCountsByCategory();
    return successResponse(
      categories.map((category) => ({
        ...toAdminCategory(category, locale),
        videoCount: counts[category.id] ?? 0,
      })),
    );
  });
}

/**
 * POST /api/categories
 * Create a new category
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Validate request body
    const validation = await validateRequestBody(request, CategoryCreateSchema);
    
    if (!validation.success) {
      return validation.error;
    }
    
    // Create category
    const category = await createCategory(validation.data);
    
    return successResponse(toAdminCategory(category), 201);
  });
}
