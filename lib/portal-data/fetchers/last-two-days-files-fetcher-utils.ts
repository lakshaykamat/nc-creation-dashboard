/**
 * Recently Allocated Articles Fetcher Utility Functions
 * 
 * Pure utility functions for fetching recently allocated articles
 * Uses the internal API route /api/articles/recently-allocated
 * 
 * @module lib/portal-data/recently-allocated-articles-fetcher-utils
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
 * Fetch recently allocated articles from internal API route
 * 
 * @param request - Optional NextRequest object for server-side URL construction and cookie forwarding
 * @returns Array of recently allocated article data
 * @throws Error if fetch fails
 */
export async function fetchRecentlyAllocatedArticles(request?: NextRequest): Promise<LastTwoDaysFileData[]> {
  const baseUrl = getApiBaseUrl(request)
  const apiUrl = `${baseUrl}/api/articles/recently-allocated`
  
  // Forward cookies from the original request for authentication
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  }
  
  // Forward cookies from the original request (server-to-server)
  if (request) {
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader
    }
  }
  
  const response = await fetch(apiUrl, {
    method: "GET",
    headers,
    cache: "no-store",
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = (errorData as { message?: string })?.message || response.statusText
    throw new Error(`Failed to fetch recently allocated articles: ${errorMessage}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

