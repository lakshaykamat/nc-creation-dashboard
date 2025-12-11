/**
 * Portal HTML Fetcher Utility Functions
 * 
 * Pure utility functions for fetching portal HTML
 * 
 * @module lib/portal-data/portal-html-fetcher-utils
 */

import { PORTAL_WORKFLOW_URL, PORTAL_LOGIN_CREDENTIALS } from "@/lib/constants/portal-constants"

/**
 * Fetch portal HTML content
 * 
 * @returns HTML string from portal
 * @throws Error if fetch fails
 */
export async function fetchPortalHtml(): Promise<string> {
  const response = await fetch(PORTAL_WORKFLOW_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Connection": "keep-alive",
    },
    body: PORTAL_LOGIN_CREDENTIALS,
    cache: "no-store",
    keepalive: true,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch portal data: ${response.statusText}`)
  }

  return response.text()
}

