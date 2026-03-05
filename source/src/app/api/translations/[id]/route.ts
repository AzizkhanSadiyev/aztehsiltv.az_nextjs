/**
 * Translations API Route Handler
 * GET /api/translations/[id] - Get translation
 * PUT /api/translations/[id] - Update translation
 * DELETE /api/translations/[id] - Delete translation
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validateRequestBody,
  withErrorHandling,
} from "@/lib/api-helpers";
import {
  deleteTranslation,
  getTranslationById,
  isTranslationKeyTaken,
  updateTranslation,
} from "@/lib/data/translations.data";
import { TranslationUpdateSchema } from "@/lib/models/translation.model";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const translation = await getTranslationById(id);
    if (!translation) {
      return notFoundResponse("Translation");
    }
    return successResponse(translation);
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const validation = await validateRequestBody(request, TranslationUpdateSchema);
    if (!validation.success) {
      return validation.error;
    }

    if (validation.data.id !== id) {
      return errorResponse("INVALID_ID", "Mismatched translation id.", 400);
    }

    if (validation.data.key) {
      const keyTaken = await isTranslationKeyTaken(
        validation.data.key,
        validation.data.id,
      );
      if (keyTaken) {
        return errorResponse(
          "KEY_TAKEN",
          "Translation key must be unique.",
          400,
        );
      }
    }

    const updated = await updateTranslation(validation.data);
    if (!updated) {
      return notFoundResponse("Translation");
    }
    return successResponse(updated);
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const deleted = await deleteTranslation(id);
    if (!deleted) {
      return notFoundResponse("Translation");
    }
    return successResponse({ id });
  });
}
