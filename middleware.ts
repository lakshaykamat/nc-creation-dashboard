import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_COOKIE_NAMES, type UserRole } from "@/lib/auth-utils"
import { canAccessPage } from "@/lib/page-permissions"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page and API routes
  if (pathname === "/login" || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Check for auth cookies
  const authToken = request.cookies.get(AUTH_COOKIE_NAMES.TOKEN)
  const authRole = request.cookies.get(AUTH_COOKIE_NAMES.ROLE)

  // If no auth token or role, redirect to login
  if (!authToken?.value || !authRole?.value) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Basic validation: check that cookies have non-empty values
  // Full password validation happens in API routes (which support Node.js crypto)
  if (authToken.value.trim() === "" || authRole.value.trim() === "") {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check page permissions using centralized configuration
  const userRole = authRole.value as UserRole
  if (!canAccessPage(pathname, userRole)) {
    // Redirect to home page if user doesn't have access
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Allow access to protected routes
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

