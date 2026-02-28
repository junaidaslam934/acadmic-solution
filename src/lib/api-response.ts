import { NextResponse } from 'next/server';

interface ApiSuccessOptions {
  status?: number;
  headers?: Record<string, string>;
}

interface ApiErrorOptions {
  status?: number;
}

/**
 * Standardized success response
 */
export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  options: ApiSuccessOptions = {}
) {
  const { status = 200, headers } = options;
  const response = NextResponse.json(
    { success: true, ...data },
    { status }
  );
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}

/**
 * Standardized error response
 */
export function apiError(message: string, options: ApiErrorOptions = {}) {
  const { status = 500 } = options;
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}
