/**
 * Last Two Days Files Fetcher Utility Functions
 * 
 * Pure utility functions for fetching last two days files data
 * 
 * @module lib/portal-data/last-two-days-files-fetcher-utils
 */

type LastTwoDaysFileData = {
  "Article number": string
  "Done by": string
  [key: string]: unknown
}

const LAST_TWO_DAYS_FILES_URL = "https://n8n-ex6e.onrender.com/webhook/last-two-days-files"

/**
 * Fetch last two days files data
 * 
 * @returns Array of last two days file data
 * @throws Error if fetch fails
 */
export async function fetchLastTwoDaysFilesData(): Promise<LastTwoDaysFileData[]> {
  const response = await fetch(LAST_TWO_DAYS_FILES_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Connection": "keep-alive",
    },
    cache: "no-store",
    keepalive: true,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch last two days files data: ${response.statusText}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

