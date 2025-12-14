import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_COOKIE_NAMES, type UserRole } from "@/lib/auth/auth-utils"
import { canAccessPage } from "@/lib/common/page-permissions-utils"
import { hasValidCookies, isValidApiKey } from "@/lib/api/auth-middleware"

/**
 * Next.js Middleware
 * 
 * Handles authentication and authorization for page routes.
 * Uses centralized authentication logic from auth-middleware.
 * 
 * Note: Middleware runs at edge runtime, so it uses lightweight checks.
 * Full password validation happens in API routes.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page, API routes, and public files
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next()
  }

  // Check authentication via cookie or API key (centralized logic)
  const hasCookies = hasValidCookies(request)
  const hasApiKey = isValidApiKey(request)

  // If neither cookie nor API key is valid, redirect to login
  if (!hasCookies && !hasApiKey) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For API key authentication, allow access (no role-based permissions)
  if (hasApiKey && !hasCookies) {
    return NextResponse.next()
  }

  // For cookie authentication, check page permissions
  const authRole = request.cookies.get(AUTH_COOKIE_NAMES.ROLE)
  if (authRole?.value) {
    const userRole = authRole.value as UserRole
    if (!canAccessPage(pathname, userRole)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

