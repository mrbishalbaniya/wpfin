import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/transactions', '/add-transaction', '/reports', '/profile', '/borrow-lend', '/visiting-card']

// Public routes that should redirect to dashboard if authenticated
const publicRoutes = ['/login', '/register']

// Public routes that should always be accessible without authentication
const alwaysPublicRoutes = ['/share', '/vcard']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // Check if the current path is always public (like share links and visiting cards)
  const isAlwaysPublic = alwaysPublicRoutes.some(route => pathname.startsWith(route))
  
  // Allow always public routes to pass through without any checks
  if (isAlwaysPublic) {
    return NextResponse.next()
  }

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing public route with valid token, redirect to dashboard
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow the request to continue
  return NextResponse.next()
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
}