/**
 * Broadcasts API Route Handler
 * GET /api/broadcasts - List broadcasts
 * POST /api/broadcasts - Create broadcast
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { successResponse, errorResponse, withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/broadcasts
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    return successResponse([]);
  });
}

/**
 * POST /api/broadcasts
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    return errorResponse(
      "BROADCASTS_REMOVED",
      "Broadcasts are managed as categories. This endpoint is disabled.",
      410,
    );
  });
}
