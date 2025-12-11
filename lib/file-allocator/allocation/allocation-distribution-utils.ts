/**
 * Allocation Distribution Utility Functions
 * 
 * Pure utility functions for distributing articles to team members
 * 
 * @module lib/file-allocator/allocation-distribution-utils
 */

import type { PriorityField } from "@/lib/constants/file-allocator-constants"
import type { ParsedArticle, AllocatedArticle } from "@/types/file-allocator"
import { ALLOCATION_METHODS } from "@/lib/constants/file-allocator-constants"

/**
 * Normalize allocation method string for comparison
 * 
 * @param allocationMethod - Raw allocation method string
 * @returns Normalized allocation method
 */
function normalizeAllocationMethod(allocationMethod: string): string {
  return allocationMethod?.toLowerCase().trim() || ALLOCATION_METHODS.BY_PRIORITY
}

/**
 * Check if allocation method is "allocate by pages"
 * 
 * @param allocationMethod - Allocation method string
 * @returns True if method is "allocate by pages"
 */
function isAllocateByPages(allocationMethod: string): boolean {
  return normalizeAllocationMethod(allocationMethod) === ALLOCATION_METHODS.BY_PAGES.toLowerCase()
}

/**
 * Sort articles by pages in descending order
 * 
 * @param articles - Array of articles to sort
 * @returns Sorted array (largest pages first)
 */
function sortArticlesByPagesDescending(articles: ParsedArticle[]): ParsedArticle[] {
  return [...articles].sort((a, b) => b.pages - a.pages)
}

/**
 * Create DDN allocated articles from parsed articles
 * 
 * @param parsedArticles - All parsed articles
 * @param ddnSet - Set of DDN article IDs
 * @param month - Current month name
 * @param date - Current date in DD/MM/YYYY format
 * @returns Array of DDN allocated articles
 */
function createDdnAllocatedArticles(
  parsedArticles: ParsedArticle[],
  ddnSet: Set<string>,
  month: string,
  date: string
): AllocatedArticle[] {
  return parsedArticles
    .filter((article) => ddnSet.has(article.articleId))
    .map((article) => ({
      name: "DDN",
      articleId: article.articleId,
      pages: article.pages,
      month,
      date,
    }))
}

/**
 * Allocate articles to a single person by pages (largest first)
 * 
 * @param availableArticles - Articles available for allocation (sorted by pages)
 * @param assignedArticleIds - Set of already assigned article IDs
 * @param personName - Name of the person
 * @param count - Number of articles to allocate
 * @param month - Current month name
 * @param date - Current date in DD/MM/YYYY format
 * @returns Array of allocated articles for this person
 */
function allocateByPagesToPerson(
  availableArticles: ParsedArticle[],
  assignedArticleIds: Set<string>,
  personName: string,
  count: number,
  month: string,
  date: string
): AllocatedArticle[] {
  const result: AllocatedArticle[] = []
  let articlesAllocated = 0

  for (const article of availableArticles) {
    if (assignedArticleIds.has(article.articleId)) {
      continue
    }

    if (articlesAllocated < count) {
      result.push({
        name: personName,
        articleId: article.articleId,
        pages: article.pages,
        month,
        date,
      })
      assignedArticleIds.add(article.articleId)
      articlesAllocated++
    }

    if (articlesAllocated >= count) {
      break
    }
  }

  return result
}

/**
 * Allocate articles to a single person by priority (first available)
 * 
 * @param availableArticles - Articles available for allocation
 * @param assignedArticleIds - Set of already assigned article IDs
 * @param personName - Name of the person
 * @param count - Number of articles to allocate
 * @param month - Current month name
 * @param date - Current date in DD/MM/YYYY format
 * @returns Array of allocated articles for this person
 */
function allocateByPriorityToPerson(
  availableArticles: ParsedArticle[],
  assignedArticleIds: Set<string>,
  personName: string,
  count: number,
  month: string,
  date: string
): AllocatedArticle[] {
  const result: AllocatedArticle[] = []
  let articlesAllocated = 0

  for (const article of availableArticles) {
    if (assignedArticleIds.has(article.articleId)) {
      continue
    }

    result.push({
      name: personName,
      articleId: article.articleId,
      pages: article.pages,
      month,
      date,
    })
    assignedArticleIds.add(article.articleId)
    articlesAllocated++

    if (articlesAllocated >= count) {
      break
    }
  }

  return result
}

/**
 * Distributes articles to team members based on priority fields and allocation method.
 * 
 * This function implements the core allocation algorithm:
 * - DDN articles are allocated first (highest priority)
 * - Remaining articles are distributed based on allocation method:
 *   - "allocate by pages": Allocates N largest articles (by page count) to each person
 *   - "allocate by priority": Allocates first N available articles to each person
 * 
 * @param priorityFields - Array of priority fields with allocation counts
 * @param parsedArticles - Array of all parsed articles
 * @param ddnArticles - Array of DDN article IDs (already allocated)
 * @param allocationMethod - Allocation method ("allocate by pages" or "allocate by priority")
 * @param month - Current month name
 * @param date - Current date in DD/MM/YYYY format
 * @returns Array of allocated articles with person/DDN name
 */
export function distributeArticles(
  priorityFields: PriorityField[],
  parsedArticles: ParsedArticle[],
  ddnArticles: string[],
  allocationMethod: string,
  month: string,
  date: string
): AllocatedArticle[] {
  // Early return if no articles
  if (!parsedArticles || parsedArticles.length === 0) {
    return []
  }

  const ddnSet = new Set(ddnArticles)

  // 1) DDN rows (top priority)
  const ddnRows = createDdnAllocatedArticles(parsedArticles, ddnSet, month, date)

  // 2) Remaining articles available for people allocation
  let availableArticles = parsedArticles.filter(
    (article) => !ddnSet.has(article.articleId)
  )

  // Sort articles if allocating by pages
  if (isAllocateByPages(allocationMethod)) {
    availableArticles = sortArticlesByPagesDescending(availableArticles)
  }

  // Track which articles have been assigned to avoid duplicates
  const assignedArticleIds = new Set<string>()
  const result: AllocatedArticle[] = []

  // Iterate through priority fields in order
  for (const field of priorityFields) {
    const rawValue = field?.value || 0

    if (rawValue <= 0) continue

    if (isAllocateByPages(allocationMethod)) {
      const allocated = allocateByPagesToPerson(
        availableArticles,
        assignedArticleIds,
        field.label,
        rawValue,
        month,
        date
      )
      result.push(...allocated)
    } else {
      const allocated = allocateByPriorityToPerson(
        availableArticles,
        assignedArticleIds,
        field.label,
        rawValue,
        month,
        date
      )
      result.push(...allocated)
    }
  }
  
  // DDN first, then person allocations
  return [...ddnRows, ...result]
}

