/**
 * Article Extraction from Email Utility Functions
 * 
 * Pure utility functions for extracting articles from email HTML content
 * 
 * @module lib/emails/article-extraction-from-email-utils
 */

import { extractArticleData } from "@/lib/common/article-extractor"
import { getEmailHtmlContent } from "@/lib/emails/email/email-content-utils"
import { getEmailSenderAddress } from "@/lib/emails/email/email-sender-utils"
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
  // Log that we're extracting articles from this email
  const senderEmail = getEmailSenderAddress(email)
  console.log("🚀 [extractUniqueArticlesFromEmail] Starting extraction for email:", {
    id: email.id,
    subject: email.subject,
    from: senderEmail,
  })
  
  const htmlContent = getEmailHtmlContent(email)
  // Pass email info for debugging when viewing individual emails
  const result = extractArticleData(htmlContent, {
    id: email.id,
    subject: email.subject,
    from: senderEmail,
  })
  
  if (!result || result.articles.length === 0) {
    return {
      articleNumbers: [],
      pageMap: {},
      formattedEntries: [],
    }
  }
  
  // Convert new format to old format for backward compatibility
  const articleNumbers = result.articles.map(a => a.articleId)
  const uniqueArticles = getUniqueArticleNumbers(articleNumbers)
  
  if (uniqueArticles.length === 0) {
    return {
      articleNumbers: [],
      pageMap: {},
      formattedEntries: [],
    }
  }
  
  // Build page map from articles array
  const articlePageCounts: Record<string, number> = {}
  result.articles.forEach(article => {
    articlePageCounts[article.articleId] = article.pageNumber
  })
  
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

