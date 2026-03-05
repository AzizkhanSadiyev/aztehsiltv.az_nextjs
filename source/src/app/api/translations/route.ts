/**
 * Translations API Route Handler
 * GET /api/translations - List all translations
 * POST /api/translations - Create new translation
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequestBody,
  withErrorHandling,
} from "@/lib/api-helpers";
import {
  createTranslation,
  getAllTranslations,
  isTranslationKeyTaken,
} from "@/lib/data/translations.data";
import { TranslationCreateSchema } from "@/lib/models/translation.model";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const translations = await getAllTranslations();
    return successResponse(translations);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const validation = await validateRequestBody(request, TranslationCreateSchema);
    if (!validation.success) {
      return validation.error;
    }

    const keyTaken = await isTranslationKeyTaken(validation.data.key);
    if (keyTaken) {
      return errorResponse(
        "KEY_TAKEN",
        "Translation key must be unique.",
        400,
      );
    }

    const translation = await createTranslation(validation.data);
    return successResponse(translation, 201);
  });
}
