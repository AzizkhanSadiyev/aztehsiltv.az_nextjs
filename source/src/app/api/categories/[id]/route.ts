/**
 * Single Category API Route Handler
 * GET /api/categories/[id] - Get single category
 * PUT /api/categories/[id] - Update category
 * DELETE /api/categories/[id] - Delete category
 */

export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  validateRequestBody,
  withErrorHandling
} from '@/lib/api-helpers';
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  categoryHasChildren
} from '@/lib/data/categories.data';
import { CategoryUpdateSchema } from '@/lib/models/category.model';
import type { Category } from '@/types/category.types';
import type { LocalizedString } from '@/types/admin.types';
import { getVideoCountsByCategory } from '@/lib/data/videos.data';

const DEFAULT_LOCALE = 'en';

const LOCALES = ["az", "en", "ru"] as const;
type Locale = (typeof LOCALES)[number];

function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v);
}

function pickLocalized(value: LocalizedString, locale: string = DEFAULT_LOCALE) {
  const key: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;

  return value?.[key] || value?.az || value?.en || value?.ru || "";
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/categories/[id]
 * Get single category by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const category = await getCategoryById(id);
    
    if (!category) {
      return notFoundResponse('Category');
    }
    
    const locale = request.nextUrl.searchParams.get('lang') || DEFAULT_LOCALE;
    const counts = await getVideoCountsByCategory();
    return successResponse({
      ...toAdminCategory(category, locale),
      videoCount: counts[category.id] ?? 0,
    });
  });
}

/**
 * PUT /api/categories/[id]
 * Update an existing category
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    
    // Validate request body
    const validation = await validateRequestBody(
      request,
      CategoryUpdateSchema.omit({ id: true })
    );
    
    if (!validation.success) {
      return validation.error;
    }
    
    // Ensure ID matches
    const updateData = { ...validation.data, id };
    
    // Update category
    const category = await updateCategory(updateData);
    
    if (!category) {
      return notFoundResponse('Category');
    }
    
    return successResponse(toAdminCategory(category));
  });
}

/**
 * DELETE /api/categories/[id]
 * Delete a category
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    
    // Check if category has children
    const hasChildren = await categoryHasChildren(id);
    if (hasChildren) {
      return errorResponse(
        'CATEGORY_HAS_CHILDREN',
        'Cannot delete category with subcategories',
        400
      );
    }
    
    const deleted = await deleteCategory(id);
    
    if (!deleted) {
      return notFoundResponse('Category');
    }
    
    return successResponse({ message: 'Category deleted successfully' });
  });
}
