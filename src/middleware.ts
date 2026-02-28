import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For demo purposes, we'll allow access to admin routes
  // In a real app, you'd check authentication tokens here
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // In production, check if user is authenticated and has admin role
    // For now, we'll just allow access for demo purposes
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};