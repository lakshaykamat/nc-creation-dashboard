/**
 * Allocation Result Utility Functions
 * 
 * Pure utility functions for building final allocation results
 * 
 * @module lib/file-allocator/allocation-result-utils
 */

import type { PriorityField } from "@/lib/constants/file-allocator-constants"
import type {
  ParsedArticle,
  AllocatedArticle,
  PersonAllocation,
  FinalAllocationResult,
} from "@/types/file-allocator"
import { distributeArticles } from "./allocation-distribution-utils"

/**
 * Extract DDN articles with pages from parsed articles
 * 
 * @param parsedArticles - All parsed articles
 * @param ddnSet - Set of DDN article IDs
 * @param month - Current month name
 * @param date - Current date in DD/MM/YYYY format
 * @returns Array of DDN articles with pages
 */
function extractDdnArticlesWithPages(
  parsedArticles: ParsedArticle[],
  ddnSet: Set<string>,
  month: string,
  date: string
): Array<{ articleId: string; pages: number; month: string; date: string }> {
  return parsedArticles
    .filter((article) => ddnSet.has(article.articleId))
    .map((article) => ({
      articleId: article.articleId,
      pages: article.pages,
      month,
      date,
    }))
}

/**
 * Extract unallocated articles from parsed articles
 * 
 * @param parsedArticles - All parsed articles
 * @param allocatedArticleIds - Set of allocated article IDs
 * @param month - Current month name
 * @param date - Current date in DD/MM/YYYY format
 * @returns Array of unallocated articles
 */
function extractUnallocatedArticles(
  parsedArticles: ParsedArticle[],
  allocatedArticleIds: Set<string>,
  month: string,
  date: string
): Array<{ articleId: string; pages: number; month: string; date: string }> {
  return parsedArticles
    .filter((article) => !allocatedArticleIds.has(article.articleId))
    .map((article) => ({
      articleId: article.articleId,
      pages: article.pages,
      month,
      date,
    }))
}

/**
 * Group allocated articles by person name
 * 
 * @param allocatedArticles - Array of all allocated articles
 * @returns Array of person allocations grouped by person
 */
function groupAllocatedArticlesByPerson(
  allocatedArticles: AllocatedArticle[]
): PersonAllocation[] {
  const personMap = new Map<string, Array<{ articleId: string; pages: number; month: string; date: string }>>()
  
  for (const allocated of allocatedArticles) {
    // Skip DDN articles
    if (allocated.name === "DDN") continue
    
    if (!personMap.has(allocated.name)) {
      personMap.set(allocated.name, [])
    }
    personMap.get(allocated.name)!.push({
      articleId: allocated.articleId,
      pages: allocated.pages,
      month: allocated.month,
      date: allocated.date,
    })
  }

  // Convert map to array
  return Array.from(personMap.entries()).map(
    ([person, articles]) => ({
      person,
      articles,
    })
  )
}

/**
 * Builds the final allocation object from form data for submission.
 * 
 * This function:
 * - Groups articles by person name
 * - Separates DDN articles into their own array
 * - Identifies unallocated articles
 * 
 * @param priorityFields - Array of priority fields with allocation counts
 * @param parsedArticles - Array of all parsed articles
 * @param ddnArticles - Array of DDN article IDs
 * @param allocationMethod - Allocation method used
 * @param month - Current month name
 * @param date - Current date in DD/MM/YYYY format
 * @returns Final allocation object ready for submission
 */
export function buildFinalAllocation(
  priorityFields: PriorityField[],
  parsedArticles: ParsedArticle[],
  ddnArticles: string[],
  allocationMethod: string,
  month: string,
  date: string
): FinalAllocationResult {
  const ddnSet = new Set(ddnArticles)
  
  // Get DDN articles with pages
  const ddnArticlesWithPages = extractDdnArticlesWithPages(
    parsedArticles,
    ddnSet,
    month,
    date
  )

  // Get allocated articles
  const allocatedArticles = distributeArticles(
    priorityFields,
    parsedArticles,
    ddnArticles,
    allocationMethod,
    month,
    date
  )

  // Get all allocated article IDs (DDN + person allocations)
  const allocatedArticleIds = new Set(
    allocatedArticles.map((a) => a.articleId)
  )

  // Find unallocated articles
  const unallocatedArticles = extractUnallocatedArticles(
    parsedArticles,
    allocatedArticleIds,
    month,
    date
  )

  // Group person allocations by person name
  const personAllocations = groupAllocatedArticlesByPerson(allocatedArticles)

  return {
    personAllocations,
    ddnArticles: ddnArticlesWithPages,
    unallocatedArticles,
  }
}

