/**
 * Utility to parse pasted article data (article IDs and pages only)
 * 
 * Supports multiple formats:
 * - "ARTICLE_ID [PAGES]"
 * - "ARTICLE_ID"
 * - Lines with just article IDs
 * 
 * @module lib/file-allocator/articles/parse-pasted-allocation
 */

import {
  ARTICLE_WITH_PAGES_PATTERN,
  ARTICLE_ID_PATTERN,
  DATE_PATTERN_SLASH,
  DATE_PATTERN_DASH,
  TIME_PATTERN,
  PAGE_COUNT_PATTERN,
} from "@/lib/constants/article-regex-constants"

export interface ParsedArticleEntry {
  articleId: string
  pages: number
}

/**
 * Parses pasted text to extract article IDs and pages
 * 
 * Priority logic:
 * 1. Find date pattern (with or without time)
 * 2. Take the number immediately before the date as pages
 * 3. If no date found, take the next number after article ID
 * 
 * Overrides duplicates (latest value wins). All article IDs are unique.
 * 
 * @param text - Pasted text with article data
 * @returns Array of parsed article entries (unique by article ID)
 */
export function parsePastedAllocation(text: string): ParsedArticleEntry[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  // Split into tokens (words separated by whitespace/tabs/newlines)
  const tokens = text.split(/\s+/).map(t => t.trim()).filter(t => t.length > 0)
  const entriesMap = new Map<string, ParsedArticleEntry>()

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim()

    // Check if token is an article ID
    if (ARTICLE_ID_PATTERN.test(token)) {
      const articleId = token.toUpperCase()
      let pages = 0

      // Priority 1: Look for date pattern first
      let foundDate = false
      for (let j = i + 1; j < tokens.length && j < i + 10; j++) {
        const currentToken = tokens[j].trim()
        const nextToken = tokens[j + 1]?.trim() || ""

        // Check if current token is a date pattern
        const isDate = DATE_PATTERN_SLASH.test(currentToken) || DATE_PATTERN_DASH.test(currentToken)
        const isTime = TIME_PATTERN.test(nextToken)

        if (isDate) {
          // Found date! Get the number immediately before it
          if (j > i) {
            const prevToken = tokens[j - 1].trim()
            // Check if previous token is a number
            if (PAGE_COUNT_PATTERN.test(prevToken)) {
              const num = parseInt(prevToken, 10)
              if (num >= 0 && num <= 10000) {
                pages = num
                foundDate = true
                break
              }
            }
          }
        }
      }

      // Priority 2: If no date found, look for the next number after article ID
      if (!foundDate) {
        for (let j = i + 1; j < tokens.length && j < i + 6; j++) {
          const nextToken = tokens[j].trim()
          
          // Check if it's a pure number
          if (PAGE_COUNT_PATTERN.test(nextToken)) {
            const num = parseInt(nextToken, 10)
            if (num >= 0 && num <= 10000) {
              pages = num
              break
            }
          }
        }
      }

      // Override if already exists (latest value wins) - ensures unique article IDs
      entriesMap.set(articleId, {
        articleId,
        pages,
      })
    }
  }

  return Array.from(entriesMap.values())
}

/**
 * Calculates distribution of articles across priority fields proportionally
 * 
 * @param totalArticles - Total number of articles to distribute
 * @param priorityFields - Current priority fields with their values
 * @returns Map of field index to new allocation count
 */
export function calculateProportionalDistribution(
  totalArticles: number,
  priorityFields: Array<{ value: number }>
): Map<number, number> {
  const distribution = new Map<number, number>()
  
  if (priorityFields.length === 0 || totalArticles <= 0) {
    return distribution
  }

  // Calculate total current allocation
  const currentTotal = priorityFields.reduce((sum, field) => sum + (field.value || 0), 0)

  if (currentTotal === 0) {
    // If no current allocation, distribute evenly
    const perPerson = Math.floor(totalArticles / priorityFields.length)
    const remainder = totalArticles % priorityFields.length
    
    priorityFields.forEach((_, index) => {
      distribution.set(index, perPerson + (index < remainder ? 1 : 0))
    })
  } else {
    // Distribute proportionally based on current ratios
    let distributed = 0
    
    priorityFields.forEach((field, index) => {
      const ratio = (field.value || 0) / currentTotal
      const count = index === priorityFields.length - 1
        ? totalArticles - distributed // Last person gets remainder
        : Math.round(totalArticles * ratio)
      
      distribution.set(index, count)
      distributed += count
    })
  }

  return distribution
}

