/**
 * Article Uniqueness Utility Functions
 * 
 * Pure utility functions for handling unique article numbers
 * 
 * @module lib/emails/article-uniqueness-utils
 */

/**
 * Get unique article numbers from an array (removes duplicates)
 * 
 * @param articleNumbers - Array of article numbers (may contain duplicates)
 * @returns Array of unique article numbers (uppercase, trimmed)
 */
export function getUniqueArticleNumbers(articleNumbers: string[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []
  
  for (const article of articleNumbers) {
    const normalized = article.toUpperCase().trim()
    if (!seen.has(normalized)) {
      seen.add(normalized)
      unique.push(normalized)
    }
  }
  
  return unique
}

