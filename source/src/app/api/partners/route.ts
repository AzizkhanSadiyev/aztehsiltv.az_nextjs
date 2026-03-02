/**
 * Partners API Route Handler
 * GET /api/partners - List all partners
 * POST /api/partners - Create new partner
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  successResponse,
  validateRequestBody,
  withErrorHandling,
} from "@/lib/api-helpers";
import { getAllPartners, createPartner } from "@/lib/data/partners.data";
import { PartnerCreateSchema } from "@/lib/models/partner.model";

/**
 * GET /api/partners
 */
export async function GET(_request: NextRequest) {
  return withErrorHandling(async () => {
    const partners = await getAllPartners();
    return successResponse(partners);
  });
}

/**
 * POST /api/partners
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const validation = await validateRequestBody(request, PartnerCreateSchema);

    if (!validation.success) {
      return validation.error;
    }

    const partner = await createPartner(validation.data);
    return successResponse(partner, 201);
  });
}
