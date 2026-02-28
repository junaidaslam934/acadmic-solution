import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// NOTE: jsonwebtoken doesn't work in Edge runtime (middleware).
// Token verification is done in API routes/server components instead.
// Middleware only checks for cookie/token existence as a gate.

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/api/auth/',
  '/api/forgot-password',
  '/api/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and root page
  if (pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/uploads') || pathname.startsWith('/routine')) {
    return NextResponse.next();
  }

  // Get auth token from cookie or Authorization header
  const token = request.cookies.get('auth_token')?.value ||
    (request.headers.get('Authorization')?.startsWith('Bearer ') 
      ? request.headers.get('Authorization')!.slice(7) 
      : null);

  // Protected page routes
  const isProtectedPage =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/class-advisor') ||
    pathname.startsWith('/coordinator');

  if (isProtectedPage && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For protected API routes, verify token exists
  if (pathname.startsWith('/api/') && !PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/teacher/:path*',
    '/class-advisor/:path*',
    '/coordinator/:path*',
    '/api/:path*',
  ],
};