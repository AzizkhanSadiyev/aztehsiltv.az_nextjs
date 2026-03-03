/**
 * Single Broadcast API Route Handler
 * GET /api/broadcasts/[id] - Get broadcast
 * PUT /api/broadcasts/[id] - Update broadcast
 * DELETE /api/broadcasts/[id] - Delete broadcast
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
  getBroadcastById,
  updateBroadcast,
  deleteBroadcast,
} from "@/lib/data/broadcasts.data";
import { BroadcastUpdateSchema } from "@/lib/models/broadcast.model";
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/broadcasts/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const broadcast = await getBroadcastById(id);

    if (!broadcast) {
      return notFoundResponse("Broadcast");
    }

    const locale = request.nextUrl.searchParams.get("lang") || DEFAULT_LOCALE;
    return successResponse(toAdminBroadcast(broadcast, locale));
  });
}

/**
 * PUT /api/broadcasts/[id]
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;

    const validation = await validateRequestBody(request, BroadcastUpdateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const updateData = { ...validation.data, id };
    const broadcast = await updateBroadcast(updateData);

    if (!broadcast) {
      return notFoundResponse("Broadcast");
    }

    return successResponse(toAdminBroadcast(broadcast));
  });
}

/**
 * DELETE /api/broadcasts/[id]
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const deleted = await deleteBroadcast(id);

    if (!deleted) {
      return notFoundResponse("Broadcast");
    }

    return successResponse({ message: "Broadcast deleted successfully" });
  });
}
