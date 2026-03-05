/**
 * Pages API Route Handler
 * GET /api/pages - List all pages
 * POST /api/pages - Create new page
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequestBody,
  withErrorHandling,
} from "@/lib/api-helpers";
import {
  createPage,
  getAllPages,
  isPageSlugTaken,
  resolvePageSlug,
} from "@/lib/data/pages.data";
import { PageCreateSchema } from "@/lib/models/page.model";

export async function GET() {
  return withErrorHandling(async () => {
    const pages = await getAllPages();
    return successResponse(pages);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const validation = await validateRequestBody(request, PageCreateSchema);
    if (!validation.success) {
      return validation.error;
    }

    const slugValue = resolvePageSlug(
      validation.data.title,
      validation.data.slug,
    );
    const slugTaken = await isPageSlugTaken(slugValue);
    if (slugTaken) {
      return errorResponse(
        "SLUG_TAKEN",
        "Slug must be unique. Another page already uses this slug.",
        400,
      );
    }

    const page = await createPage({
      ...validation.data,
      slug: slugValue,
    });
    return successResponse(page, 201);
  });
}
