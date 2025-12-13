/**
 * Form Analytics Logger
 * 
 * Domain-specific wrapper for logging form submission analytics
 * Uses the generic analytics logger utility
 * 
 * @module lib/db/form-analytics-logger
 */

import { logAnalytics } from "@/lib/db/analytics-logger"
import type { FinalAllocationResult } from "@/types/file-allocator"
import type { UserDeviceInfo } from "@/lib/utils/request-utils"

/**
 * Form analytics log structure
 */
export interface FormAnalyticsLog {
  domain: string
  timestamp: Date
  urlPath: string
  formData: FinalAllocationResult
  summary: {
    totalPersonAllocations: number
    totalDdnArticles: number
    totalUnallocatedArticles: number
    personNames: string[]
    articleIds: string[]
    totalArticles: number
    totalPages: number
  }
}

/**
 * Calculate summary statistics from allocation data
 */
function calculateSummary(allocation: FinalAllocationResult): FormAnalyticsLog["summary"] {
  const personNames = allocation.personAllocations.map(p => p.person)
  const articleIds: string[] = []
  let totalPages = 0

  // Collect article IDs and pages from person allocations
  allocation.personAllocations.forEach(personAlloc => {
    personAlloc.articles.forEach(article => {
      articleIds.push(article.articleId)
      totalPages += article.pages
    })
  })

  // Collect article IDs and pages from DDN articles
  allocation.ddnArticles.forEach(article => {
    articleIds.push(article.articleId)
    totalPages += article.pages
  })

  // Collect article IDs and pages from unallocated articles
  allocation.unallocatedArticles.forEach(article => {
    articleIds.push(article.articleId)
    totalPages += article.pages
  })

  return {
    totalPersonAllocations: allocation.personAllocations.length,
    totalDdnArticles: allocation.ddnArticles.length,
    totalUnallocatedArticles: allocation.unallocatedArticles.length,
    personNames,
    articleIds,
    totalArticles: articleIds.length,
    totalPages,
  }
}

/**
 * Log form analytics to MongoDB
 * 
 * Uses the generic logAnalytics utility under the hood
 * 
 * @param allocation - The final allocation result from form submission
 * @param url - The full URL (including query params) where the form was submitted
 * @param userDetails - Optional user device and browser information
 * @returns Promise that resolves when log is saved
 */
export async function logFormAnalytics(
  allocation: FinalAllocationResult,
  url: string,
  userDetails?: UserDeviceInfo
): Promise<void> {
  const summary = calculateSummary(allocation)

  let ref: string | undefined
  try {
    const urlObj = new URL(url)
    ref = urlObj.searchParams.get("ref") || undefined
  } catch {
    // If URL parsing fails, ref remains undefined
  }

  await logAnalytics(
    "article allocator",
    url,
    {
      formData: allocation,
      summary,
      ref,
    },
    userDetails
  )
}

