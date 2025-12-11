/**
 * Article Key Utility Functions
 * 
 * Pure utility functions for creating stable keys from arrays
 * 
 * @module lib/emails/article-key-utils
 */

/**
 * Create a stable string key from article numbers array
 * 
 * @param articleNumbers - Array of article numbers
 * @returns Sorted comma-separated string key
 */
export function createArticleNumbersKey(articleNumbers: string[]): string {
  return [...articleNumbers].sort().join(",")
}

/**
 * Create a stable string key from email IDs array
 * 
 * @param emailIds - Array of email IDs
 * @returns Sorted comma-separated string key
 */
export function createEmailIdsKey(emailIds: string[]): string {
  return [...emailIds].sort().join(",")
}

