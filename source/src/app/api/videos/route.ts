/**
 * Videos API Route Handler
 * GET /api/videos - List videos with pagination and filtering
 * POST /api/videos - Create new video
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  parsePaginationParams,
  validateRequestBody,
  withErrorHandling,
} from "@/lib/api-helpers";
import { getVideosList, createVideo } from "@/lib/data/videos.data";
import { VideoCreateSchema } from "@/lib/models/video.model";
import { pickLocalized } from "@/lib/localization";
import type { Video } from "@/types/video.types";

const DEFAULT_LOCALE = "az";

function toAdminVideo(video: Video, locale: string = DEFAULT_LOCALE) {
  return {
    ...video,
    title: pickLocalized(video.title, locale, DEFAULT_LOCALE),
    slug: pickLocalized(video.slug, locale, DEFAULT_LOCALE),
    description: video.description
      ? pickLocalized(video.description, locale, DEFAULT_LOCALE)
      : "",
    languageCode: locale,
    i18n: {
      title: video.title,
      slug: video.slug,
      description: video.description,
      tagsByLocale: video.metadata?.tagsByLocale ?? null,
    },
  };
}

/**
 * GET /api/videos
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = parsePaginationParams(searchParams);

    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const broadcastId = searchParams.get("broadcastId");
    const search = searchParams.get("search");
    const locale = searchParams.get("lang") || DEFAULT_LOCALE;

    const result = await getVideosList({
      page,
      limit,
      filters: {
        status: status === "draft" || status === "published" ? status : undefined,
        categoryId: categoryId || undefined,
        broadcastId: broadcastId || undefined,
        search: search || undefined,
      },
    });

    return paginatedResponse(
      result.videos.map((video) => toAdminVideo(video, locale)),
      page,
      limit,
      result.total,
    );
  });
}

/**
 * POST /api/videos
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const validation = await validateRequestBody(request, VideoCreateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const categoryIds = Array.isArray(validation.data.categoryIds)
      ? validation.data.categoryIds.filter(Boolean)
      : [];
    const hasCategory =
      Boolean(validation.data.categoryId) || categoryIds.length > 0;
    if (validation.data.status === "published" && !hasCategory) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Select at least one category before publishing",
        400,
      );
    }

    const video = await createVideo(validation.data);
    return successResponse(toAdminVideo(video), 201);
  });
}
