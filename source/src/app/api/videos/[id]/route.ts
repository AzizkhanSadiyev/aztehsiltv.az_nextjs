/**
 * Single Video API Route Handler
 * GET /api/videos/[id] - Get single video
 * PUT /api/videos/[id] - Update video
 * DELETE /api/videos/[id] - Delete video
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  notFoundResponse,
  validateRequestBody,
  withErrorHandling,
} from "@/lib/api-helpers";
import {
  getVideoById,
  updateVideo,
  deleteVideo,
} from "@/lib/data/videos.data";
import { VideoUpdateSchema } from "@/lib/models/video.model";
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/videos/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const video = await getVideoById(id);

    if (!video) {
      return notFoundResponse("Video");
    }

    const locale = request.nextUrl.searchParams.get("lang") || DEFAULT_LOCALE;
    return successResponse(toAdminVideo(video, locale));
  });
}

/**
 * PUT /api/videos/[id]
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;

    const validation = await validateRequestBody(request, VideoUpdateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const updateData = { ...validation.data, id };
    const video = await updateVideo(updateData);

    if (!video) {
      return notFoundResponse("Video");
    }

    return successResponse(toAdminVideo(video));
  });
}

/**
 * DELETE /api/videos/[id]
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const deleted = await deleteVideo(id);

    if (!deleted) {
      return notFoundResponse("Video");
    }

    return successResponse({ message: "Video deleted successfully" });
  });
}
