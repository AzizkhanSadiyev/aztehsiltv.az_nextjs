/**
 * Categories API Route Handler
 * GET /api/categories - List all categories
 * POST /api/categories - Create new category
 */

export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  validateRequestBody,
  withErrorHandling
} from '@/lib/api-helpers';
import { getAllCategories, createCategory, isCategorySlugTaken, resolveCategorySlug } from '@/lib/data/categories.data';
import { getVideoCountsByCategory } from '@/lib/data/videos.data';
import { CategoryCreateSchema } from '@/lib/models/category.model';
import { pickLocalized } from '@/lib/localization';
import type { Category } from '@/types/category.types';

const DEFAULT_LOCALE = 'az';

function toAdminCategory(category: Category, locale: string = DEFAULT_LOCALE) {
  return {
    ...category,
    name: pickLocalized(category.name, locale, DEFAULT_LOCALE),
    slug: category.slug,
    description: category.description
      ? pickLocalized(category.description, locale, DEFAULT_LOCALE)
      : '',
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

    const slugValue = resolveCategorySlug(
      validation.data.name,
      validation.data.slug,
    );
    const slugTaken = await isCategorySlugTaken(slugValue);
    if (slugTaken) {
      return errorResponse(
        'SLUG_TAKEN',
        'Slug must be unique. Another category already uses this slug.',
        400
      );
    }

    // Create category
    const category = await createCategory({
      ...validation.data,
      slug: slugValue,
    });
    
    return successResponse(toAdminCategory(category), 201);
  });
}
