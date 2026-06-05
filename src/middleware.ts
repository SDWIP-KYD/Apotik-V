import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isPublicRoute, isProtectedRoute } from '@/lib/routes'

function getSessionFromCookie(request: NextRequest) {
  const sessionCookie = request.cookies.get('authjs.session-token') ||
                        request.cookies.get('__Secure-authjs.session-token')

  if (!sessionCookie) {
    return null
  }

  return { exists: true }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = getSessionFromCookie(request)
  const isLoggedIn = !!session

  if (isPublicRoute(pathname)) {
    if (isLoggedIn && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

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
