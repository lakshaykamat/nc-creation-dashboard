/**
 * API route for tracking page views.
 * Handles both regular JSON and sendBeacon Blob requests.
 * Authentication is optional - tracks all pages for all users.
 * 
 * @module app/api/analytics/page-view
 */

import { NextRequest, NextResponse } from "next/server"
import { logAnalytics } from "@/lib/db/analytics-logger"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAMES } from "@/lib/constants/auth-constants"
import { extractUserDeviceInfo } from "@/lib/utils/request-utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface PageViewRequest {
  pathname: string
  userRole: string
}

/**
 * POST handler for tracking page views.
 * Non-blocking and fast - returns immediately without waiting for logging.
 */
export async function POST(request: NextRequest) {
  try {
    let body: PageViewRequest
    try {
      const contentType = request.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        body = await request.json()
      } else {
        const blob = await request.blob()
        const text = await blob.text()
        body = JSON.parse(text)
      }
    } catch {
      body = {} as PageViewRequest
    }
    
    if (!body.pathname) {
      return NextResponse.json({ success: false, message: "pathname is required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const userRoleCookie = cookieStore.get(AUTH_COOKIE_NAMES.ROLE)
    const sessionTokenCookie = cookieStore.get(AUTH_COOKIE_NAMES.TOKEN)
    const userRole = userRoleCookie?.value || body.userRole || "unknown"
    const visitorId = sessionTokenCookie?.value || `role:${userRole}`
    const userDetails = extractUserDeviceInfo(request)
    
    logAnalytics(
      "page view",
      body.pathname,
      { userRole, visitorId },
      userDetails
    ).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to track page view:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

