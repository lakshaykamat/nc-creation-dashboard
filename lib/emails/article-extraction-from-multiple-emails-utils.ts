/**
 * Article Extraction from Multiple Emails Utility Functions
 * 
 * Pure utility functions for extracting unique articles from multiple emails
 * 
 * @module lib/emails/article-extraction-from-multiple-emails-utils
 */

import { extractUniqueArticlesFromEmail } from "@/lib/emails/article-extraction-from-email-utils"
import type { Email } from "@/types/emails"

/**
 * Extract unique articles from multiple emails, removing duplicates across emails
 * 
 * @param emails - Array of email objects
 * @returns Object with articleNumbers, pageMap, and formattedEntries
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

