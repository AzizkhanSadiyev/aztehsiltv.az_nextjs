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
  deleteCategoryWithReparent,
  deleteCategoryCascade,
  isCategorySlugTaken
} from '@/lib/data/categories.data';
import { CategoryUpdateSchema } from '@/lib/models/category.model';
import { pickLocalized } from '@/lib/localization';
import type { Category } from '@/types/category.types';
import { getVideoCountsByCategory } from '@/lib/data/videos.data';

const DEFAULT_LOCALE = 'az';

function toAdminCategory(
  category: Category,
  locale: string = DEFAULT_LOCALE,
  includeTranslations = false,
) {
  const base = {
    ...category,
    name: pickLocalized(category.name, locale, DEFAULT_LOCALE),
    slug: category.slug,
    description: category.description
      ? pickLocalized(category.description, locale, DEFAULT_LOCALE)
      : '',
    positions: category.positions || [],
    languageCode: locale
  };

  if (!includeTranslations) return base;

  return {
    ...base,
    translations: {
      name: category.name,
      description: category.description ?? {},
    },
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
    const includeTranslations =
      request.nextUrl.searchParams.get('mode') === 'edit';
    const counts = await getVideoCountsByCategory();
    return successResponse({
      ...toAdminCategory(category, locale, includeTranslations),
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

    if (updateData.slug) {
      updateData.slug = updateData.slug.trim();
      const slugTaken = await isCategorySlugTaken(updateData.slug, id);
      if (slugTaken) {
        return errorResponse(
          'SLUG_TAKEN',
          'Slug must be unique. Another category already uses this slug.',
          400
        );
      }
    }
    
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
    
    const forceDelete = request.nextUrl.searchParams.get('force') === '1';

    let deleted: boolean | number = false;

    if (forceDelete) {
      deleted = await deleteCategoryCascade(id);
    } else {
      try {
        deleted = await deleteCategoryWithReparent(id);
      } catch (err) {
        console.error('deleteCategoryWithReparent failed, falling back to direct delete:', err);
        deleted = await deleteCategory(id);
      }
    }
    
    if (!deleted) {
      return notFoundResponse('Category');
    }
    
    return successResponse({ message: 'Category deleted successfully' });
  });
}
