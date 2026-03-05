/**
 * Pages API Route Handler
 * GET /api/pages/[id] - Fetch single page
 * PUT /api/pages/[id] - Update page
 * DELETE /api/pages/[id] - Delete page
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validateRequestBody,
  withErrorHandling,
} from "@/lib/api-helpers";
import {
  deletePage,
  getPageById,
  isPageSlugTaken,
  resolvePageSlug,
  updatePage,
} from "@/lib/data/pages.data";
import { PageUpdateSchema } from "@/lib/models/page.model";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const page = await getPageById(id);
    if (!page) return notFoundResponse("Page");
    return successResponse(page);
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const validation = await validateRequestBody(request, PageUpdateSchema);
    if (!validation.success) {
      return validation.error;
    }

    const payload = { ...validation.data, id };
    if (payload.slug || payload.title) {
      const slugValue = resolvePageSlug(
        payload.title || {},
        payload.slug,
      );
      const slugTaken = await isPageSlugTaken(slugValue, id);
      if (slugTaken) {
        return errorResponse(
          "SLUG_TAKEN",
          "Slug must be unique. Another page already uses this slug.",
          400,
        );
      }
      payload.slug = slugValue;
    }

    const updated = await updatePage(payload);
    if (!updated) return notFoundResponse("Page");
    return successResponse(updated);
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const removed = await deletePage(id);
    if (!removed) return notFoundResponse("Page");
    return successResponse({ id });
  });
}
