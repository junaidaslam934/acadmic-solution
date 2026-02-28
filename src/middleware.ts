import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/api/auth/',
  '/api/forgot-password',
  '/api/reset-password',
];

// Role-based route access
const ROLE_ROUTES: Record<string, string[]> = {
  admin: ['/admin'],
  student: ['/student'],
  staff: ['/teacher'],
  'class-advisor': ['/class-advisor'],
  coordinator: ['/coordinator'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and root page
  if (pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/uploads')) {
    return NextResponse.next();
  }

  // Check for auth token in cookie
  const token = request.cookies.get('auth_token')?.value;

  // Protected page routes need auth check
  const isProtectedPage =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/class-advisor') ||
    pathname.startsWith('/coordinator');

  if (isProtectedPage && !token) {
    // Redirect to login page if not authenticated
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For API routes that need protection, check auth header or cookie
  if (pathname.startsWith('/api/') && !PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!token && !request.headers.get('Authorization')?.startsWith('Bearer ')) {
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