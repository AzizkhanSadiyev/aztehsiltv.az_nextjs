/**
 * Broadcasts API Route Handler
 * GET /api/broadcasts - List broadcasts
 * POST /api/broadcasts - Create broadcast
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  validateRequestBody,
  withErrorHandling,
} from "@/lib/api-helpers";
import { getAllBroadcasts, createBroadcast } from "@/lib/data/broadcasts.data";
import { BroadcastCreateSchema } from "@/lib/models/broadcast.model";
import { pickLocalized } from "@/lib/localization";
import type { Broadcast } from "@/types/broadcast.types";

const DEFAULT_LOCALE = "az";

function toAdminBroadcast(broadcast: Broadcast, locale: string = DEFAULT_LOCALE) {
  return {
    ...broadcast,
    title: pickLocalized(broadcast.title, locale, DEFAULT_LOCALE),
    slug: pickLocalized(broadcast.slug, locale, DEFAULT_LOCALE),
    description: broadcast.description
      ? pickLocalized(broadcast.description, locale, DEFAULT_LOCALE)
      : "",
    languageCode: locale,
  };
}

/**
 * GET /api/broadcasts
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const locale = request.nextUrl.searchParams.get("lang") || DEFAULT_LOCALE;
    const status = request.nextUrl.searchParams.get("status");
    const broadcasts = await getAllBroadcasts();
    const filtered =
      status === "draft" || status === "published"
        ? broadcasts.filter((item) => item.status === status)
        : broadcasts;
    return successResponse(filtered.map((item) => toAdminBroadcast(item, locale)));
  });
}

/**
 * POST /api/broadcasts
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const validation = await validateRequestBody(request, BroadcastCreateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const broadcast = await createBroadcast(validation.data);
    return successResponse(toAdminBroadcast(broadcast), 201);
  });
}
