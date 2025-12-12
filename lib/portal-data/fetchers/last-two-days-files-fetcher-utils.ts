/**
 * Last Two Days Files Fetcher Utility Functions
 * 
 * Pure utility functions for fetching last two days files data
 * Uses the internal API route /api/files/recent
 * 
 * @module lib/portal-data/last-two-days-files-fetcher-utils
 */

import type { NextRequest } from "next/server"

type LastTwoDaysFileData = {
  "Article number": string
  "Done by": string
  [key: string]: unknown
}

/**
 * Get the base URL for API requests
 * In server-side context, constructs URL from request or environment
 */
function getApiBaseUrl(request?: NextRequest): string {
  if (typeof window !== "undefined") {
    // Client-side: use relative URL
    return ""
  }
  
  // Server-side: use request URL if available, otherwise use environment variables
  if (request) {
    const url = new URL(request.url)
    return `${url.protocol}//${url.host}`
  }
  
  // Fallback to environment variables or localhost
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  return "http://localhost:3000"
}

/**
 * Fetch last two days files data from internal API route
 * 
 * @param request - Optional NextRequest object for server-side URL construction
 * @returns Array of last two days file data
 * @throws Error if fetch fails
 */
export async function fetchLastTwoDaysFilesData(request?: NextRequest): Promise<LastTwoDaysFileData[]> {
  const baseUrl = getApiBaseUrl(request)
  const apiUrl = `${baseUrl}/api/files/recent`
  
  // Session authentication is handled automatically via cookies
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
    // Cookies are automatically sent with same-origin requests
    credentials: "include",
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = (errorData as { message?: string })?.message || response.statusText
    throw new Error(`Failed to fetch last two days files data: ${errorMessage}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

