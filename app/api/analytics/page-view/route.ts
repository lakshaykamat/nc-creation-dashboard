/**
 * API Route for Tracking Page Views
 * 
 * POST /api/analytics/page-view
 * 
 * Tracks page views and visitor counts
 * 
 * @module app/api/analytics/page-view
 */

import { NextRequest, NextResponse } from "next/server"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { logAnalytics } from "@/lib/db/analytics-logger"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAMES } from "@/lib/constants/auth-constants"
import { extractUserDeviceInfo } from "@/lib/utils/request-utils"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

interface PageViewRequest {
  pathname: string
  userRole: string
}

/**
 * POST handler for tracking page views
 * 
 * Optimized to be non-blocking and fast
 */
export async function POST(request: NextRequest) {
  try {
    // Handle both regular JSON and sendBeacon Blob requests
    let body: PageViewRequest
    try {
      const contentType = request.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        body = await request.json()
      } else {
        // Handle sendBeacon Blob
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

    // Allow all pages to be tracked - analytics should work for everyone
    // Authentication is optional - we'll use it if available but don't require it

    // Get user role and session token from cookies
    const cookieStore = await cookies()
    const userRoleCookie = cookieStore.get(AUTH_COOKIE_NAMES.ROLE)
    const sessionTokenCookie = cookieStore.get(AUTH_COOKIE_NAMES.TOKEN)
    const userRole = userRoleCookie?.value || body.userRole || "unknown"
    
    // Use session token as unique visitor identifier (it's unique per login session)
    // If no token, fallback to role (less accurate but better than nothing)
    const visitorId = sessionTokenCookie?.value || `role:${userRole}`
    
    // Extract user device and browser information
    const userDetails = extractUserDeviceInfo(request)
    
    // Log page view analytics (don't await - fire and forget to avoid blocking)
    logAnalytics(
      "page view",
      body.pathname,
      {
        userRole,
        visitorId, // Store visitor ID for accurate unique visitor counting
      },
      userDetails
    ).catch(() => {
      // Silently fail - analytics shouldn't block the response
    })

    // Return immediately without waiting for logging to complete
    return NextResponse.json({ success: true })
  } catch (error) {
    // Silently fail - we don't want to break the app if analytics fails
    console.error("Failed to track page view:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

