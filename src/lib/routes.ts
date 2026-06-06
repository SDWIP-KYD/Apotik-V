// Route definitions for RBAC

export const publicRoutes = ['/login', '/auth/error']

export const protectedRoutes = [
  '/dashboard',
  '/patients',
  '/medical-records',
  '/inventory',
  '/prescriptions',
  '/profile',
]

export const doctorOnlyRoutes = ['/audit-logs']

export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))
}

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))
}

export function isDoctorOnlyRoute(pathname: string): boolean {
  return doctorOnlyRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))
}
