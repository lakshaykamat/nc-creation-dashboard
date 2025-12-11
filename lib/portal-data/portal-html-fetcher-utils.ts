/**
 * Portal HTML Fetcher Utility Functions
 * 
 * Pure utility functions for fetching portal HTML
 * 
 * @module lib/portal-data/portal-html-fetcher-utils
 */

const PORTAL_URL = "https://powertrack3.aptaracorp.com/AptaraVendorAPI/vendorWorkflow.html"
const FORM_DATA = "userName=NCXMLR&psw=NCXMLR123"

/**
 * Fetch portal HTML content
 * 
 * @returns HTML string from portal
 * @throws Error if fetch fails
 */
export async function fetchPortalHtml(): Promise<string> {
  const response = await fetch(PORTAL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Connection": "keep-alive",
    },
    body: FORM_DATA,
    cache: "no-store",
    keepalive: true,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch portal data: ${response.statusText}`)
  }

  return response.text()
}

