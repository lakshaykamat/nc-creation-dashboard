/**
 * Filter Allocated Articles Utility Functions
 * 
 * Pure utility functions for filtering out already allocated articles
 * 
 * @module lib/file-allocator/filter-allocated-articles-utils
 */

import type { ParsedArticle } from "@/types/file-allocator"
import type { LastTwoDaysFileData } from "@/types/portal-data"
import { extractArticleNumbersFromLastTwoDaysFiles } from "@/lib/emails/article-extraction-utils"
import { createArticleNumberSet } from "@/lib/emails/article-set-utils"

/**
 * Result of filtering articles
 */
export interface FilteredArticlesResult {
  parsedArticles: ParsedArticle[]
  filteredOutCount: number
  filteredOutArticles: string[]
}

/**
 * Create allocated article set from last two days files data
 * 
 * @param lastTwoDaysFiles - Last two days files data
 * @returns Set of allocated article numbers (uppercase)
 */
function createAllocatedArticleSet(lastTwoDaysFiles: LastTwoDaysFileData[]): Set<string> {
  const allocatedNumbers = extractArticleNumbersFromLastTwoDaysFiles(lastTwoDaysFiles)
  return createArticleNumberSet(allocatedNumbers)
}

/**
 * Filter out already allocated articles from parsed articles
 * 
 * @param allParsed - All parsed articles from input
 * @param allocatedArticleSet - Set of allocated article numbers
 * @returns Object with unallocated articles and metadata
 */
function filterUnallocatedArticles(
  allParsed: ParsedArticle[],
  allocatedArticleSet: Set<string>
): {
  unallocated: ParsedArticle[]
  filteredCount: number
  filteredArticles: string[]
} {
  const unallocated = allParsed.filter(
    (article) => !allocatedArticleSet.has(article.articleId.toUpperCase())
  )
  
  const filteredCount = allParsed.length - unallocated.length
  const filteredArticles = allParsed
    .filter((article) => allocatedArticleSet.has(article.articleId.toUpperCase()))
    .map((article) => article.articleId)
  
  return {
    unallocated,
    filteredCount,
    filteredArticles,
  }
}

/**
 * Filter out already allocated articles from parsed articles
 * 
 * @param allParsed - All parsed articles from input
 * @param lastTwoDaysFiles - Last two days files data containing allocated articles
 * @returns Filtered articles result with unallocated articles and metadata
 */
export function filterAllocatedArticles(
  allParsed: ParsedArticle[],
  lastTwoDaysFiles: LastTwoDaysFileData[]
): FilteredArticlesResult {
  const allocatedArticleSet = createAllocatedArticleSet(lastTwoDaysFiles)
  const { unallocated, filteredCount, filteredArticles } = filterUnallocatedArticles(
    allParsed,
    allocatedArticleSet
  )
  
  return {
    parsedArticles: unallocated,
    filteredOutCount: filteredCount,
    filteredOutArticles: filteredArticles,
  }
}

