/**
 * Single User API Route Handler
 * GET /api/users/[id] - Get single user
 * PUT /api/users/[id] - Update user
 * DELETE /api/users/[id] - Delete user
 */

export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  validateRequestBody,
  withErrorHandling
} from '@/lib/api-helpers';
import { auth } from '@/auth';
import {
  getUserById,
  updateUser,
  deleteUser
} from '@/lib/data/users.data';
import { UserUpdateSchema } from '@/lib/models/user.model';

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
    console.error('User API auth error:', error);
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }
}

/**
 * GET /api/users/[id]
 * Get single user by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  return withErrorHandling(async () => {
    const guard = await requirePermission(['users.view', 'users.manage']);
    if (guard) return guard;
    const { id } = await context.params;
    const user = await getUserById(id);
    
    if (!user) {
      return notFoundResponse('User');
    }
    
    return successResponse(user);
  });
}

/**
 * PUT /api/users/[id]
 * Update an existing user
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  return withErrorHandling(async () => {
    const guard = await requirePermission(['users.manage']);
    if (guard) return guard;
    const { id } = await context.params;
    
    // Validate request body
    const validation = await validateRequestBody(
      request,
      UserUpdateSchema.omit({ id: true })
    );
    
    if (!validation.success) {
      return validation.error;
    }
    
    // Ensure ID matches
    const updateData = { ...validation.data, id };
    
    // Update user
    const user = await updateUser(updateData);
    
    if (!user) {
      return notFoundResponse('User');
    }
    
    return successResponse(user);
  });
}

/**
 * DELETE /api/users/[id]
 * Delete a user
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  return withErrorHandling(async () => {
    const guard = await requirePermission(['users.manage']);
    if (guard) return guard;
    const { id } = await context.params;
    const deleted = await deleteUser(id);
    
    if (!deleted) {
      return notFoundResponse('User');
    }
    
    return successResponse({ message: 'User deleted successfully' });
  });
}
