/**
 * API Client Functions for Articles
 * 
 * Client-side functions to call article API endpoints
 * 
 * @module lib/api/articles-api
 */

import { getApiHeaders } from "@/lib/api/api-client"
import type { ParseArticlesRequest, ParseArticlesResponse, ParsePastedAllocationRequest, ParsePastedAllocationResponse } from "@/types/api-articles"

/**
 * Parse article data from array of strings
 */
export async function parseArticles(request: ParseArticlesRequest): Promise<ParseArticlesResponse> {
  const response = await fetch("/api/articles/parse", {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(request),
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to parse articles" }))
    throw new Error(error.message || "Failed to parse articles")
  }

  return response.json()
}

/**
 * Parse pasted allocation data
 */
export async function parsePastedAllocation(request: ParsePastedAllocationRequest): Promise<ParsePastedAllocationResponse> {
  const response = await fetch("/api/articles/parse-pasted", {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(request),
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to parse pasted data" }))
    throw new Error(error.message || "Failed to parse pasted data")
  }

  return response.json()
}

