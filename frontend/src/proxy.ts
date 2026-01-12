import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes that require authentication
  const protectedRoutes = ['/my-feeds', '/preferences', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Auth routes (login, register)
  const authRoutes = ['/auth/login', '/auth/register'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Get the token from NextAuth
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isAuthenticated = !!token;

  // If accessing protected route without authentication, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // If accessing admin route, check for admin role
  if (pathname.startsWith('/admin') && isAuthenticated) {
    const roles = token?.roles as any[] || [];
    const hasAdminRole = roles.some((role: any) => 
      role.name === 'admin' || role.name === 'super-admin'
    );
    
    if (!hasAdminRole) {
      return NextResponse.redirect(new URL('/my-feeds', request.url));
    }
  }

  // If accessing auth routes while authenticated, redirect to my-feeds
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/my-feeds', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
