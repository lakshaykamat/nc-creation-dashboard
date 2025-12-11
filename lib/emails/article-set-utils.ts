/**
 * Article Set Utility Functions
 * 
 * Pure utility functions for creating and working with article sets
 * 
 * @module lib/emails/article-set-utils
 */

/**
 * Create a Set of article numbers for quick lookup
 * 
 * @param articleNumbers - Array of article numbers
 * @returns Set of article numbers
 */
export function createArticleNumberSet(articleNumbers: string[]): Set<string> {
  return new Set(articleNumbers)
}

