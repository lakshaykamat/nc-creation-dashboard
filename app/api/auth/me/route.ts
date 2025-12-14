import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/api/auth-middleware"

export const dynamic = "force-dynamic"

/**
 * GET /api/auth/me
 * 
 * Returns the current authenticated user's role.
 * Supports both cookie-based (web) and API key (mobile) authentication.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (user.authenticated) {
      return NextResponse.json({ role: user.role, authenticated: true })
    }

    return NextResponse.json({ role: null }, { status: 200 })
  } catch (error) {
    console.error("Get user role error:", error)
    return NextResponse.json({ role: null }, { status: 200 })
  }
}

