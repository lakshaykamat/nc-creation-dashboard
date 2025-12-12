/**
 * Authentication Middleware for API Routes
 * 
 * Provides utility functions to validate authentication for protected routes.
 * Uses session-based authentication (cookies) for internal routes.
 * 
 * @module lib/api/auth-middleware
 */

import { NextRequest, NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth/validate-auth"

/**
 * Validates session authentication from cookies
 * 
 * @param request - Next.js request object (unused but kept for consistency)
 * @returns NextResponse with 401 if invalid, null if valid
 */
export async function validateSessionAuth(_request: NextRequest): Promise<NextResponse | null> {
  const authResult = await validateAuth()

  if (!authResult.valid) {
    return NextResponse.json(
      { error: "Unauthorized - Please log in" },
      { status: 401 }
    )
  }

  return null
}

/**
 * Validates API key from request headers (for server-side external API calls only)
 * This is used when calling external APIs like n8n webhooks
 * 
 * @param request - Next.js request object
 * @returns NextResponse with 401 if invalid, null if valid
 */
export function validateApiKey(_request: NextRequest): NextResponse | null {
  const apiKey = process.env.NEXT_PUBLIC_NC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    )
  }

  const requestApiKey = _request.headers.get("X-API-KEY")

  if (!requestApiKey || requestApiKey !== apiKey) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid API key" },
      { status: 401 }
    )
  }

  return null
}
