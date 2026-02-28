import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/api/auth/',
  '/api/forgot-password',
  '/api/reset-password',
];

// Map roles to allowed route prefixes
const ROLE_ACCESS: Record<string, string[]> = {
  admin: ['/admin'],
  chairman: ['/admin'],
  co_chairman: ['/admin', '/coordinator'],
  ug_coordinator: ['/coordinator'],
  class_advisor: ['/class-advisor', '/teacher'],
  teacher: ['/teacher'],
  student: ['/student'],
};

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

  // Get auth token
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

  if (isProtectedPage) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token and check role access
    const payload = verifyToken(token);
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const allowedPaths = ROLE_ACCESS[payload.role] || [];
    const hasAccess = allowedPaths.some((prefix) => pathname.startsWith(prefix));
    if (!hasAccess) {
      // Redirect to their appropriate dashboard
      const defaultPath = allowedPaths[0] || '/login';
      return NextResponse.redirect(new URL(`${defaultPath}/dashboard`, request.url));
    }
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