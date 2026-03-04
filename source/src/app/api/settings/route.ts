/**
 * Settings API Route Handler
 * GET /api/settings - Fetch site settings
 * PUT /api/settings - Update site settings
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  validateRequestBody,
  withErrorHandling,
} from "@/lib/api-helpers";
import { getSiteSettings, updateSiteSettings } from "@/lib/data/settings.data";
import { SettingsUpdateSchema } from "@/lib/models/settings.model";

export async function GET() {
  return withErrorHandling(async () => {
    const settings = await getSiteSettings();
    return successResponse(settings);
  });
}

export async function PUT(request: NextRequest) {
  return withErrorHandling(async () => {
    const validation = await validateRequestBody(request, SettingsUpdateSchema);
    if (!validation.success) {
      return validation.error;
    }

    const updated = await updateSiteSettings(validation.data);
    return successResponse(updated);
  });
}
