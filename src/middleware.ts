import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isPublicRoute, isProtectedRoute, isDoctorOnlyRoute } from '@/lib/routes'

// Simple session check using cookies (Edge-compatible)
function getSessionFromCookie(request: NextRequest) {
  const sessionCookie = request.cookies.get('authjs.session-token') ||
                        request.cookies.get('__Secure-authjs.session-token')

  if (!sessionCookie) {
    return null
  }

  // We can't decode JWT in Edge Runtime without proper libraries
  // For now, we just check if the cookie exists
  // The actual session validation happens server-side via NextAuth
  return { exists: true }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = getSessionFromCookie(request)
  const isLoggedIn = !!session

  // Allow public routes
  if (isPublicRoute(pathname)) {
    // If logged in and trying to access login page, redirect to dashboard
    if (isLoggedIn && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Check if route requires authentication
  if (isProtectedRoute(pathname) && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
