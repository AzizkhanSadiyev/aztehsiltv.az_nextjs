/**
 * User Password Reset API Route Handler (Admin)
 * PUT /api/users/[id]/password - Reset user password
 */

export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-helpers';
import { auth } from '@/auth';
import { getUserById, setUserPassword } from '@/lib/data/users.data';
import { UserAdminPasswordSchema } from '@/lib/models/user.model';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function requirePermission(required: string[]) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }
    if (session.user.role === 'admin') {
      return null;
    }
    const permissions = session.user.permissions || [];
    const allowed = required.some((perm) => permissions.includes(perm));
    if (!allowed) {
      return errorResponse('FORBIDDEN', 'Permission required', 403);
    }
    return null;
  } catch (error) {
    console.error('Password reset auth error:', error);
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }
}

/**
 * PUT /api/users/[id]/password
 * Reset user password (admin only)
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  return withErrorHandling(async () => {
    const guard = await requirePermission(['users.manage']);
    if (guard) return guard;

    const { id } = await context.params;

    const validation = await validateRequestBody(request, UserAdminPasswordSchema);
    if (!validation.success) {
      return validation.error;
    }

    const existing = await getUserById(id);
    if (!existing) {
      return notFoundResponse('User');
    }

    const updated = await setUserPassword(id, validation.data.password);
    if (!updated) {
      return notFoundResponse('User');
    }

    return successResponse({ message: 'Password updated successfully' });
  });
}
