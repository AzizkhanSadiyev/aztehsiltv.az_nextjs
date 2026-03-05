/**
 * Video view tracking
 * POST /api/videos/[id]/view - Increment view count
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  withErrorHandling,
} from "@/lib/api-helpers";
import { incrementVideoViews } from "@/lib/data/videos.data";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    if (!id) {
      return errorResponse("INVALID_ID", "Video id is required.", 400);
    }

    const views = await incrementVideoViews(id, 1);
    if (views === null) {
      return notFoundResponse("Video");
    }

    return successResponse({ views });
  });
}
