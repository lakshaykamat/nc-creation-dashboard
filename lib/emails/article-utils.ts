/**
 * Article Utility Functions
 * 
 * Pure utility functions for article operations (no business logic)
 * 
 * @module lib/emails/article-utils
 */

import type { LastTwoDaysFileData } from "@/types/portal-data"

/**
 * Extract article numbers from last two days files data
 */
export function extractArticleNumbersFromLastTwoDaysFiles(
  data: LastTwoDaysFileData[]
): string[] {
  return data
    .map((item) => item["Article number"])
    .filter((num): num is string => typeof num === "string")
    .map((num) => num.trim().toUpperCase())
}

/**
 * Create a Set of article numbers for quick lookup
 */
export function createArticleNumberSet(articleNumbers: string[]): Set<string> {
  return new Set(articleNumbers)
}

/**
 * Create a stable string key from article numbers array
 */
export function createArticleNumbersKey(articleNumbers: string[]): string {
  return [...articleNumbers].sort().join(",")
}

/**
 * Create a stable string key from email IDs array
 */
export function createEmailIdsKey(emailIds: string[]): string {
  return [...emailIds].sort().join(",")
}

/**
 * Count how many detected articles are allocated
 */
export function countAllocatedArticles(
  detectedArticles: string[],
  allocatedArticleSet: Set<string>
): number {
  let count = 0
  detectedArticles.forEach((articleNumber) => {
    if (allocatedArticleSet.has(articleNumber.toUpperCase())) {
      count++
    }
  })
  return count
}

