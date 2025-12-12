/**
 * Article Extraction Utility Functions
 * 
 * Pure utility functions for extracting article numbers from data
 * 
 * @module lib/emails/article-extraction-utils
 */

import type { LastTwoDaysFileData } from "@/types/portal-data"

/**
 * Extract article numbers from last two days files data
 * 
 * Excludes articles where Completed is "Not at portal" as these are not
 * considered allocated.
 * 
 * @param data - Last two days files data
 * @returns Array of article numbers (uppercase, trimmed)
 */
export function extractArticleNumbersFromLastTwoDaysFiles(
  data: LastTwoDaysFileData[]
): string[] {
  return data
    .filter((item) => item.Completed !== "Not at portal")
    .map((item) => item["Article number"])
    .filter((num): num is string => typeof num === "string")
    .map((num) => num.trim().toUpperCase())
}

