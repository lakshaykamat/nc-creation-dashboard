/**
 * Authentication Middleware for API Routes
 * 
 * Centralized authentication logic for all API routes.
 * Supports dual authentication: session-based (cookies) for web, API key for mobile.
 * 
 * @module lib/api/auth-middleware
 */

import { NextRequest, NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth/validate-auth"
import { AUTH_COOKIE_NAMES, type UserRole } from "@/lib/auth/auth-utils"

/**
 * Validates API key from request headers
 * Works in both server and edge runtime (middleware)
 * 
 * @param request - Next.js request object
 * @returns true if valid, false otherwise
 */
export function isValidApiKey(request: NextRequest): boolean {
  const apiKey = process.env.NEXT_PUBLIC_NC_API_KEY

  if (!apiKey) {
    return false
  }

  const requestApiKey = request.headers.get("X-API-KEY")
  return requestApiKey === apiKey
}

/**
 * Checks if cookies exist and have non-empty values
 * Lightweight check for middleware (edge runtime)
 * Full validation happens in API routes
 * 
 * @param request - Next.js request object
 * @returns true if cookies exist and are non-empty, false otherwise
 */
export function hasValidCookies(request: NextRequest): boolean {
  const authToken = request.cookies.get(AUTH_COOKIE_NAMES.TOKEN)
  const authRole = request.cookies.get(AUTH_COOKIE_NAMES.ROLE)

  if (!authToken?.value || !authRole?.value) {
    return false
  }

  return authToken.value.trim() !== "" && authRole.value.trim() !== ""
}

/**
 * Validates authentication via cookie or API key
 * 
 * Authentication flow:
 * 1. First checks for session cookie authentication (web)
 * 2. If no valid cookie, checks for X-API-KEY header (mobile)
 * 
 * @param request - Next.js request object
 * @returns NextResponse with 401 if invalid, null if valid
 */
export async function validateSessionAuth(request: NextRequest): Promise<NextResponse | null> {
  // Try cookie-based authentication first
  const authResult = await validateAuth()

  if (authResult.valid) {
    return null
  }

  // If cookie auth fails, try API key authentication
  if (isValidApiKey(request)) {
    return null
  }

  return NextResponse.json(
    { error: "Unauthorized - Please log in or provide valid API key" },
    { status: 401 }
  )
}

/**
 * Validates API key from request headers (for server-side external API calls only)
 * This is used when calling external APIs like n8n webhooks
 * 
 * @param request - Next.js request object
 * @returns NextResponse with 401 if invalid, null if valid
 */
export function validateApiKey(request: NextRequest): NextResponse | null {
  if (isValidApiKey(request)) {
    return null
  }

  const apiKey = process.env.NEXT_PUBLIC_NC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: "Unauthorized - Invalid API key" },
    { status: 401 }
  )
}

/**
 * Gets authenticated user information from cookie or API key
 * 
 * @param request - Next.js request object
 * @returns User role if authenticated via cookie, or authenticated flag if via API key, or null
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<{ role: UserRole | null; authenticated: boolean }> {
  // Try cookie-based authentication first
  const authResult = await validateAuth()

  if (authResult.valid && authResult.role) {
    return { role: authResult.role, authenticated: true }
  }

  // If no cookie, check for API key
  if (isValidApiKey(request)) {
    return { role: null, authenticated: true }
  }

  return { role: null, authenticated: false }
}
