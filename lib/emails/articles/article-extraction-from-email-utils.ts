/**
 * Article Extraction from Email Utility Functions
 * 
 * Pure utility functions for extracting articles from email HTML content
 * 
 * @module lib/emails/article-extraction-from-email-utils
 */

import { extractArticleData } from "@/lib/common/article-extractor"
import { getEmailHtmlContent } from "@/lib/emails/email/email-content-utils"
import { getUniqueArticleNumbers } from "@/lib/emails/articles/article-uniqueness-utils"
import { buildArticlePageMapAndEntries } from "@/lib/emails/articles/article-page-map-utils"
import type { Email } from "@/types/emails"

/**
 * Extract unique articles from email HTML content
 * 
 * @param email - Email object
 * @returns Object with articleNumbers, pageMap, and formattedEntries
 */
export function extractUniqueArticlesFromEmail(email: Email): {
  articleNumbers: string[]
  pageMap: Record<string, number>
  formattedEntries: string[]
} {
  const htmlContent = getEmailHtmlContent(email)
  const result = extractArticleData(htmlContent)
  
  if (!result || !result.hasArticles || !result.articleNumbers || result.articleNumbers.length === 0) {
    return {
      articleNumbers: [],
      pageMap: {},
      formattedEntries: [],
    }
  }
  
  // Get unique articles
  const uniqueArticles = getUniqueArticleNumbers(result.articleNumbers)
  
  if (uniqueArticles.length === 0) {
    return {
      articleNumbers: [],
      pageMap: {},
      formattedEntries: [],
    }
  }
  
  // Build page map and formatted entries
  const articlePageCounts = result.articlePageCounts || {}
  const { pageMap, formattedEntries } = buildArticlePageMapAndEntries(
    uniqueArticles,
    articlePageCounts
  )
  
  return {
    articleNumbers: uniqueArticles,
    pageMap,
    formattedEntries,
  }
}

