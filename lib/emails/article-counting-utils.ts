/**
 * Article Counting Utility Functions
 * 
 * Pure utility functions for counting articles
 * 
 * @module lib/emails/article-counting-utils
 */

/**
 * Count how many detected articles are allocated
 * 
 * @param detectedArticles - Array of detected article numbers
 * @param allocatedArticleSet - Set of allocated article numbers
 * @returns Count of allocated articles
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

