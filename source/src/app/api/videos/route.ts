/**
 * Videos API Route Handler
 * GET /api/videos - List videos with pagination and filtering
 * POST /api/videos - Create new video
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  paginatedResponse,
  parsePaginationParams,
  validateRequestBody,
  withErrorHandling,
} from "@/lib/api-helpers";
import { getVideosList, createVideo } from "@/lib/data/videos.data";
import { VideoCreateSchema } from "@/lib/models/video.model";
import type { Video } from "@/types/video.types";
import type { LocalizedString, Locale } from "@/types/admin.types";

const DEFAULT_LOCALE: Locale = "az";
const isLocale = (value: string): value is Locale =>
  value === "az" || value === "en" || value === "ru";

function pickLocalized(value: LocalizedString, locale: string = DEFAULT_LOCALE) {
  const safeLocale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return value?.[safeLocale] || value?.az || value?.en || value?.ru || "";
}

function toAdminVideo(video: Video, locale: string = DEFAULT_LOCALE) {
  return {
    ...video,
    title: pickLocalized(video.title, locale),
    slug: pickLocalized(video.slug, locale),
    description: video.description ? pickLocalized(video.description, locale) : "",
    languageCode: locale,
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

    const video = await createVideo(validation.data);
    return successResponse(toAdminVideo(video), 201);
  });
}
