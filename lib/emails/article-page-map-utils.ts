/**
 * Article Page Map Utility Functions
 * 
 * Pure utility functions for building article page maps
 * 
 * @module lib/emails/article-page-map-utils
 */

/**
 * Build page map for unique articles
 * 
 * @param uniqueArticles - Array of unique article numbers
 * @param articlePageCounts - Map of article numbers to page counts
 * @returns Record mapping article numbers to page counts
 */
function buildPageMap(
  uniqueArticles: string[],
  articlePageCounts: Record<string, number>
): Record<string, number> {
  const pageMap: Record<string, number> = {}
  
  uniqueArticles.forEach((article) => {
    // Look up pages from articlePageCounts (articles are stored in uppercase)
    // Use safe access with fallback to 0
    const pages = articlePageCounts[article] ?? articlePageCounts[article.toUpperCase()] ?? 0
    pageMap[article] = pages
  })
  
  return pageMap
}

/**
 * Build formatted entries for articles
 * 
 * @param uniqueArticles - Array of unique article numbers
 * @param pageMap - Map of article numbers to page counts
 * @returns Array of formatted strings like "ARTICLE [PAGES]"
 */
function buildFormattedEntries(
  uniqueArticles: string[],
  pageMap: Record<string, number>
): string[] {
  return uniqueArticles.map((article) => {
    const pages = pageMap[article] || 0
    return `${article} [${pages}]`
  })
}

/**
 * Build page map and formatted entries for articles
 * 
 * @param uniqueArticles - Array of unique article numbers
 * @param articlePageCounts - Map of article numbers to page counts
 * @returns Object with pageMap and formattedEntries
 */
export function buildArticlePageMapAndEntries(
  uniqueArticles: string[],
  articlePageCounts: Record<string, number>
): {
  pageMap: Record<string, number>
  formattedEntries: string[]
} {
  const pageMap = buildPageMap(uniqueArticles, articlePageCounts)
  const formattedEntries = buildFormattedEntries(uniqueArticles, pageMap)
  
  return {
    pageMap,
    formattedEntries,
  }
}

