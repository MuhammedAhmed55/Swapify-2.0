import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/accept-invite',
];

// Define routes that authenticated users should be redirected from (e.g., login page)
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/sign-up',
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for static files and Next.js internal routes
  if (
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.includes('.') || // Files with extensions
    path === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

 

  // All other cases, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css)$).*)",
  ],
};
