/**
 * API Helper Functions
 * Provides utilities for consistent API responses and error handling
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString()
      }
    },
    { status }
  );
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  status: number = 200
): NextResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / limit);
  
  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    },
    { status }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    },
    { status }
  );
}

/**
 * Handle validation errors from Zod
 */
export function validationErrorResponse(
  error: ZodError
): NextResponse<ApiResponse<never>> {
  const fieldErrors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));

  return errorResponse(
    'VALIDATION_ERROR',
    'Validation failed',
    400,
    { fields: fieldErrors }
  );
}

/**
 * Handle not found errors
 */
export function notFoundResponse(
  resource: string
): NextResponse<ApiResponse<never>> {
  return errorResponse(
    'NOT_FOUND',
    `${resource} not found`,
    404
  );
}

/**
 * Handle method not allowed errors
 */
export function methodNotAllowedResponse(
  allowedMethods: string[]
): NextResponse<ApiResponse<never>> {
  return errorResponse(
    'METHOD_NOT_ALLOWED',
    `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
    405
  );
}

/**
 * Handle internal server errors
 */
export function internalErrorResponse(
  error: Error
): NextResponse<ApiResponse<never>> {
  console.error('Internal Server Error:', error);
  
  return errorResponse(
    'INTERNAL_ERROR',
    'An internal server error occurred',
    500,
    process.env.NODE_ENV === 'development' ? {
      message: error.message,
      stack: error.stack
    } : undefined
  );
}

/**
 * Parse pagination parameters from URL search params
 */
export function parsePaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  
  return { page, limit };
}

/**
 * Parse JSON body safely
 */
export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch (error) {
    return null;
  }
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T }
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await parseJsonBody(request);
    
    if (!body) {
      return {
        success: false,
        error: errorResponse('INVALID_JSON', 'Invalid JSON in request body', 400)
      };
    }
    
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: validationErrorResponse(error)
      };
    }
    
    return {
      success: false,
      error: errorResponse('VALIDATION_ERROR', 'Request validation failed', 400)
    };
  }
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiResponse<never>>> {
  return handler().catch((error: Error) => {
    return internalErrorResponse(error);
  });
}
