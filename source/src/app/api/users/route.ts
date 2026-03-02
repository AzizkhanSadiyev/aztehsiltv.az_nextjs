/**
 * Users API Route Handler
 * GET /api/users - List all users
 * POST /api/users - Create new user
 */

export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  validateRequestBody,
  withErrorHandling
} from '@/lib/api-helpers';
import { auth } from '@/auth';
import { getAllUsers, createUser, emailExists } from '@/lib/data/users.data';
import { UserCreateSchema } from '@/lib/models/user.model';

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
    console.error('Users API auth error:', error);
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }
}

/**
 * GET /api/users
 * List all users
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const guard = await requirePermission(['users.view', 'users.manage']);
    if (guard) return guard;
    const users = await getAllUsers();
    return successResponse(users);
  });
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const guard = await requirePermission(['users.manage']);
    if (guard) return guard;
    // Validate request body
    const validation = await validateRequestBody(request, UserCreateSchema);
    
    if (!validation.success) {
      return validation.error;
    }
    
    // Check if email already exists
    const exists = await emailExists(validation.data.email);
    if (exists) {
      return errorResponse(
        'EMAIL_EXISTS',
        'A user with this email already exists',
        400
      );
    }
    
    // Create user
    const user = await createUser(validation.data);
    
    return successResponse(user, 201);
  });
}
