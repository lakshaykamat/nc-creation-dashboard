/**
 * Unallocated Articles Sorting Utility Functions
 * 
 * Pure utility functions for sorting unallocated articles
 * 
 * @module lib/file-allocator/unallocated-articles-sorting-utils
 */

import type { AllocatedArticle } from "@/types/file-allocator"
import { ALLOCATION_METHODS } from "@/lib/constants/file-allocator-constants"

/**
 * Normalize allocation method string for comparison
 * 
 * @param allocationMethod - Raw allocation method string
 * @returns Normalized allocation method
 */
function normalizeAllocationMethod(allocationMethod: string): string {
  return allocationMethod?.toLowerCase().trim() || ""
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
function sortByPagesDescending(articles: AllocatedArticle[]): AllocatedArticle[] {
  return [...articles].sort((a, b) => b.pages - a.pages)
}

/**
 * Sort unallocated articles based on allocation method
 * 
 * @param articles - Array of unallocated articles
 * @param allocationMethod - Allocation method used
 * @returns Sorted array of articles
 */
export function sortUnallocatedArticles(
  articles: AllocatedArticle[],
  allocationMethod: string
): AllocatedArticle[] {
  if (isAllocateByPages(allocationMethod)) {
    return sortByPagesDescending(articles)
  }
  return articles
}

