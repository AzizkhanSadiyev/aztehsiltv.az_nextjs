/**
 * Languages API Route Handler
 * GET /api/languages - List all languages
 * POST /api/languages - Create new language
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
  getAllLanguages,
  createLanguage,
  isLanguageCodeTaken,
} from "@/lib/data/languages.data";
import { LanguageCreateSchema } from "@/lib/models/language.model";

/**
 * GET /api/languages
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const active = request.nextUrl.searchParams.get("active");
    const activeOnly = active === "1" || active === "true";
    const languages = await getAllLanguages(activeOnly);
    return successResponse(languages);
  });
}

/**
 * POST /api/languages
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const validation = await validateRequestBody(request, LanguageCreateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const codeTaken = await isLanguageCodeTaken(validation.data.code);
    if (codeTaken) {
      return errorResponse(
        "CODE_TAKEN",
        "Language code must be unique.",
        400,
      );
    }

    const language = await createLanguage(validation.data);
    return successResponse(language, 201);
  });
}
