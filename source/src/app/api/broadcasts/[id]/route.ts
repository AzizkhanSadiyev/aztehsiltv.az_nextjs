/**
 * Single Broadcast API Route Handler
 * GET /api/broadcasts/[id] - Get broadcast
 * PUT /api/broadcasts/[id] - Update broadcast
 * DELETE /api/broadcasts/[id] - Delete broadcast
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { errorResponse, withErrorHandling } from "@/lib/api-helpers";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/broadcasts/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    return errorResponse(
      "BROADCASTS_REMOVED",
      "Broadcasts are managed as categories. This endpoint is disabled.",
      410,
    );
  });
}

/**
 * PUT /api/broadcasts/[id]
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    return errorResponse(
      "BROADCASTS_REMOVED",
      "Broadcasts are managed as categories. This endpoint is disabled.",
      410,
    );
  });
}

/**
 * DELETE /api/broadcasts/[id]
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    return errorResponse(
      "BROADCASTS_REMOVED",
      "Broadcasts are managed as categories. This endpoint is disabled.",
      410,
    );
  });
}
