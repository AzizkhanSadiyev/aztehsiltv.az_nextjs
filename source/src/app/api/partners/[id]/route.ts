/**
 * Single Partner API Route Handler
 * GET /api/partners/[id] - Get single partner
 * PUT /api/partners/[id] - Update partner
 * DELETE /api/partners/[id] - Delete partner
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
  getPartnerById,
  updatePartner,
  deletePartner,
} from "@/lib/data/partners.data";
import { PartnerUpdateSchema } from "@/lib/models/partner.model";
import type { PartnerUpdateInput } from "@/types/partner.types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/partners/[id]
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    const partner = await getPartnerById(id);

    if (!partner) {
      return notFoundResponse("Partner");
    }

    return successResponse(partner);
  });
}

/**
 * PUT /api/partners/[id]
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;

  const validation = await validateRequestBody(
    request,
    PartnerUpdateSchema.omit({ id: true }),
  );

    if (!validation.success) {
      return validation.error;
    }

    const updateData: PartnerUpdateInput = { id, ...validation.data };

    const partner = await updatePartner(updateData);

    if (!partner) {
      return notFoundResponse("Partner");
    }

    return successResponse(partner);
  });
}

/**
 * DELETE /api/partners/[id]
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;

    const deleted = await deletePartner(id);

    if (!deleted) {
      return notFoundResponse("Partner");
    }

    return successResponse({ message: "Partner deleted successfully" });
  });
}
