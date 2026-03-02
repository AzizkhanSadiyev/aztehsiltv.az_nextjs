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
import type { Broadcast } from "@/types/broadcast.types";
import type { LocalizedString, Locale } from "@/types/admin.types";

const DEFAULT_LOCALE: Locale = "az";
const isLocale = (value: string): value is Locale =>
  value === "az" || value === "en" || value === "ru";

function pickLocalized(value: LocalizedString, locale: string = DEFAULT_LOCALE) {
  const safeLocale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return value?.[safeLocale] || value?.az || value?.en || value?.ru || "";
}

function toAdminBroadcast(broadcast: Broadcast, locale: string = DEFAULT_LOCALE) {
  return {
    ...broadcast,
    title: pickLocalized(broadcast.title, locale),
    slug: pickLocalized(broadcast.slug, locale),
    description: broadcast.description
      ? pickLocalized(broadcast.description, locale)
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
