/**
 * Allocation Message Utility Functions
 * 
 * Pure utility functions for generating user-facing messages
 * 
 * @module lib/file-allocator/allocation-message-utils
 */

/**
 * Generates a user-friendly error message for over-allocation.
 * 
 * @param overBy - Number of articles over-allocated
 * @returns Formatted error message
 */
export function getOverAllocationMessage(overBy: number): string {
  return `You are allocating ${overBy} more article${overBy !== 1 ? "s" : ""} than available.`
}

/**
 * Generate toast message for filtered out articles
 * 
 * @param filteredOutCount - Number of articles filtered out
 * @param filteredOutArticles - Array of article IDs that were filtered out
 * @returns Formatted toast message string
 */
export function generateFilteredArticlesToastMessage(
  filteredOutCount: number,
  filteredOutArticles: string[]
): string {
  if (filteredOutCount === 0 || filteredOutArticles.length === 0) {
    return ""
  }

  const articleList = filteredOutArticles.slice(0, 3).join(", ")
  const moreText = filteredOutArticles.length > 3 
    ? ` and ${filteredOutArticles.length - 3} more` 
    : ""

  return `${filteredOutCount} article${filteredOutCount !== 1 ? "s" : ""} already allocated and removed: ${articleList}${moreText}`
}

