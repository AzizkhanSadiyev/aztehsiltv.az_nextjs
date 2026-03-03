/**
 * Single Language API Route Handler
 * GET /api/languages/[id] - Get language
 * PUT /api/languages/[id] - Update language
 * DELETE /api/languages/[id] - Delete language
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  validateRequestBody,
  withErrorHandling,
} from "@/lib/api-helpers";
import {
  getLanguageById,
  updateLanguage,
  deleteLanguage,
  isLanguageCodeTaken,
} from "@/lib/data/languages.data";
import { LanguageUpdateSchema } from "@/lib/models/language.model";
import type { LanguageUpdateInput } from "@/types/language.types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/languages/[id]
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const language = await getLanguageById(id);

    if (!language) {
      return notFoundResponse("Language");
    }

    return successResponse(language);
  });
}

/**
 * PUT /api/languages/[id]
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;

    const validation = await validateRequestBody(
      request,
      LanguageUpdateSchema.omit({ id: true }),
    );

    if (!validation.success) {
      return validation.error;
    }

    const updateData: LanguageUpdateInput = { id, ...validation.data };

    if (updateData.code) {
      const codeTaken = await isLanguageCodeTaken(updateData.code, id);
      if (codeTaken) {
        return errorResponse(
          "CODE_TAKEN",
          "Language code must be unique.",
          400,
        );
      }
    }

    const language = await updateLanguage(updateData);

    if (!language) {
      return notFoundResponse("Language");
    }

    return successResponse(language);
  });
}

/**
 * DELETE /api/languages/[id]
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const deleted = await deleteLanguage(id);

    if (!deleted) {
      return notFoundResponse("Language");
    }

    return successResponse({ message: "Language deleted successfully" });
  });
}
