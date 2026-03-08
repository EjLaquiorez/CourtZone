import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/teams',
  '/courts',
  '/games',
  '/settings',
  '/api/auth/me',
  '/api/users',
  '/api/teams',
  '/api/games',
  '/api/courts'
];

// Define auth routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/login',
  '/register'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/demo',
  '/community',
  '/api/auth/login',
  '/api/auth/register'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies or Authorization header
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Verify if user is authenticated
  const isAuthenticated = token ? verifyToken(token) !== null : false;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route)
  );

  // Handle protected routes
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle auth routes when already authenticated
  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard if trying to access login/register while authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Handle root route based on authentication status
  if (pathname === '/') {
    if (isAuthenticated) {
      // Redirect authenticated users to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Let unauthenticated users see the landing page
    return NextResponse.next();
  }

  // For API routes, add CORS headers
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
