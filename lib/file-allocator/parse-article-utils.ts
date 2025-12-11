/**
 * Article Parsing Utility Functions
 * 
 * Pure utility functions for parsing article data from strings
 * 
 * @module lib/file-allocator/parse-article-utils
 */

import type { ParsedArticle } from "@/types/file-allocator"

// Re-export for backward compatibility
export type { ParsedArticle }

/**
 * Parses the newArticlesWithPages array into structured article data.
 * 
 * Expected format: "ARTICLE_ID [PAGES]" (e.g., "CDC101217 [24]")
 * 
 * @param newArticlesWithPages - Array of article strings in format "ID [PAGES]"
 * @returns Array of parsed articles with articleId and pages
 * 
 * @example
 * ```ts
 * const input = ["CDC101217 [24]", "EA147928 [29]"]
 * const parsed = parseNewArticlesWithPages(input)
 * // Returns: [
 * //   { articleId: "CDC101217", pages: 24 },
 * //   { articleId: "EA147928", pages: 29 }
 * // ]
 * ```
 */
export function parseNewArticlesWithPages(
  newArticlesWithPages?: string[] | null
): ParsedArticle[] {
  if (!newArticlesWithPages || newArticlesWithPages.length === 0) {
    return []
  }

  return newArticlesWithPages.map((entry) => {
    // Match format: "ARTICLE_ID [PAGES]"
    const match = entry.match(/^([^\s\[]+)\s*\[(\d+)\]/)
    const articleId = match?.[1] ?? entry.trim()
    const pages = match ? Number(match[2]) || 0 : 0

    return { articleId, pages }
  })
}

