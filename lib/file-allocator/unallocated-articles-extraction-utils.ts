/**
 * Unallocated Articles Extraction Utility Functions
 * 
 * Pure utility functions for extracting unallocated articles
 * 
 * @module lib/file-allocator/unallocated-articles-extraction-utils
 */

import type { ParsedArticle, AllocatedArticle } from "@/types/file-allocator"
import { sortUnallocatedArticles } from "./unallocated-articles-sorting-utils"

/**
 * Extract unallocated articles from parsed articles, excluding already allocated ones
 * 
 * @param parsedArticles - All parsed articles
 * @param allocatedArticleIds - Set of already allocated article IDs
 * @param allocationMethod - Allocation method used
 * @param month - Current month name
 * @param date - Current date in DD/MM/YYYY format
 * @returns Array of unallocated articles with "NEED TO ALLOCATE" name, sorted if needed
 */
export function getUnallocatedArticles(
  parsedArticles: ParsedArticle[],
  allocatedArticleIds: Set<string>,
  allocationMethod: string,
  month: string,
  date: string
): AllocatedArticle[] {
  const unallocated = parsedArticles
    .filter((article) => !allocatedArticleIds.has(article.articleId))
    .map((article) => ({
      name: "NEED TO ALLOCATE",
      articleId: article.articleId,
      pages: article.pages,
      month,
      date,
    }))

  return sortUnallocatedArticles(unallocated, allocationMethod)
}

