/**
 * Article Allocation Utility Functions
 * 
 * Pure utility functions for article allocation operations
 * 
 * @module lib/emails/article-allocation-utils
 */

import { extractArticleData } from "@/lib/common/article-extractor"
import { getEmailHtmlContent } from "@/lib/emails/email-utils"
import type { Email } from "@/types/emails"

/**
 * Get unique article numbers from an array (removes duplicates)
 */
export function getUniqueArticleNumbers(articleNumbers: string[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []
  
  for (const article of articleNumbers) {
    const normalized = article.toUpperCase().trim()
    if (!seen.has(normalized)) {
      seen.add(normalized)
      unique.push(normalized)
    }
  }
  
  return unique
}

/**
 * Extract unique articles from email HTML content
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
  
  // Build page map for unique articles only
  const pageMap: Record<string, number> = {}
  const formattedEntries: string[] = []
  const articlePageCounts = result.articlePageCounts || {}
  
  uniqueArticles.forEach((article) => {
    // Look up pages from articlePageCounts (articles are stored in uppercase)
    // Use safe access with fallback to 0
    const pages = articlePageCounts[article] ?? articlePageCounts[article.toUpperCase()] ?? 0
    pageMap[article] = pages
    formattedEntries.push(`${article} [${pages}]`)
  })
  
  return {
    articleNumbers: uniqueArticles,
    pageMap,
    formattedEntries,
  }
}

/**
 * Extract unique articles from multiple emails, removing duplicates across emails
 */
export function extractUniqueArticlesFromMultipleEmails(emails: Email[]): {
  articleNumbers: string[]
  pageMap: Record<string, number>
  formattedEntries: string[]
} {
  const allArticles = new Set<string>()
  const articlePageMap: Record<string, number> = {}

  emails.forEach((email) => {
    const { articleNumbers, pageMap } = extractUniqueArticlesFromEmail(email)
    
    articleNumbers.forEach((article) => {
      if (!allArticles.has(article)) {
        allArticles.add(article)
        articlePageMap[article] = pageMap[article] || 0
      }
    })
  })

  const formattedEntries = Array.from(allArticles).map((article) => {
    const pages = articlePageMap[article] || 0
    return `${article} [${pages}]`
  })

  return {
    articleNumbers: Array.from(allArticles),
    pageMap: articlePageMap,
    formattedEntries,
  }
}

