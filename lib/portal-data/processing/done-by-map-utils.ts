/**
 * Done By Map Utility Functions
 * 
 * Pure utility functions for building done-by maps
 * 
 * @module lib/portal-data/done-by-map-utils
 */

type LastTwoDaysFileData = {
  "Article number": string
  "Done by": string
  [key: string]: unknown
}

/**
 * Normalize article number from data item
 * 
 * @param item - Data item
 * @returns Normalized article number or null
 */
function normalizeArticleNumber(item: LastTwoDaysFileData): string | null {
  const articleNumber = item["Article number"]
  if (!articleNumber) return null
  const num = typeof articleNumber === "string" ? articleNumber.trim() : String(articleNumber).trim()
  return num || null
}

/**
 * Normalize done by value from data item
 * 
 * @param item - Data item
 * @returns Normalized done by value or null
 */
function normalizeDoneBy(item: LastTwoDaysFileData): string | null {
  const doneBy = item["Done by"]
  if (!doneBy) return null
  const by = typeof doneBy === "string" ? doneBy.trim() : String(doneBy).trim()
  return by || null
}

/**
 * Build done-by map from last two days files data
 * 
 * @param lastTwoDaysFilesData - Array of last two days file data
 * @returns Map of article numbers to done-by values
 */
export function buildDoneByMap(lastTwoDaysFilesData: LastTwoDaysFileData[]): Map<string, string> {
  const doneByMap = new Map<string, string>()
  const len = lastTwoDaysFilesData.length

  for (let i = 0; i < len; i++) {
    const item = lastTwoDaysFilesData[i]
    if (
      item &&
      typeof item === "object" &&
      "Article number" in item &&
      "Done by" in item
    ) {
      const articleNumber = normalizeArticleNumber(item)
      const doneBy = normalizeDoneBy(item)
      
      if (articleNumber && doneBy) {
        doneByMap.set(articleNumber, doneBy)
      }
    }
  }

  return doneByMap
}

