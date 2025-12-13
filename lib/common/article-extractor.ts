/**
 * Article Extractor Utility
 * 
 * Extracts article information from raw HTML/text content.
 * 
 * @module lib/common/article-extractor
 */

import {
  ARTICLE_ID_PATTERN,
  EMFC_PATTERN,
  EMFC_WITH_NUMBER_PATTERN,
  PAGE_COUNT_PATTERN,
  SOURCE_CODE_PATTERN,
  DATE_PATTERN_SLASH,
  DATE_PATTERN_DASH,
  TIME_PATTERN,
} from "@/lib/constants/article-regex-constants"

/**
 * Article data structure
 */
export interface ArticleData {
  articleId: string
  pageNumber: number
  source?: string  // DOCX, TEX, etc.
}

/**
 * Result object returned by extractArticleData function
 */
export interface ArticleExtractionResult {
  articles: ArticleData[]
  totalFiles: number
  totalPages: number
}

/**
 * Clean HTML content by removing tags and normalizing whitespace
 */
function cleanHtmlText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")      // Replace <br> with newline
    .replace(/<\/p>/gi, "\n")           // Replace </p> with newline
    .replace(/<li[^>]*>/gi, "\n")       // Replace <li> with newline
    .replace(/<[^>]+>/g, "")            // Remove all other HTML tags
    .replace(/&nbsp;/gi, " ")          // Convert &nbsp; to space
    .replace(/\r\n/g, "\n")            // Normalize Windows line endings
    .replace(/\n{2,}/g, "\n")          // Collapse multiple newlines
    .trim()                             // Trim leading/trailing whitespace
}

/**
 * Tokenize text into array of tokens (words/numbers)
 */
function tokenizeText(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}

/**
 * Detect source (DOCX or TEX) from token immediately after article ID
 */
function detectSource(tokens: string[], articleIndex: number): string | null {
  if (articleIndex + 1 >= tokens.length) return null
  
  const nextToken = tokens[articleIndex + 1].trim().toUpperCase()
  if (nextToken === "DOCX" || nextToken === "TEX") {
    return nextToken
  }
  
  return null
}

/**
 * Check if a token matches date/time patterns
 */
function isDateToken(token: string): boolean {
  return DATE_PATTERN_SLASH.test(token) || DATE_PATTERN_DASH.test(token)
}

function isTimeToken(token: string): boolean {
  return TIME_PATTERN.test(token)
}

/**
 * Check if we've hit a date/time boundary
 */
function isDateTimeBoundary(tokens: string[], index: number): boolean {
  if (index >= tokens.length) return false
  
  const currentToken = tokens[index].trim()
  const isDate = isDateToken(currentToken)
  const isTime = isTimeToken(currentToken)
  
  // If date is found, check if next token is time
  if (isDate && index + 1 < tokens.length) {
    const nextToken = tokens[index + 1].trim()
    if (isTimeToken(nextToken)) {
      return true
    }
  }
  
  // Standalone date or time is also a boundary
  return isDate || isTime
}

/**
 * Scan forward to find page number (last valid number before date/time boundary)
 */
function extractPageNumber(
  tokens: string[],
  startIndex: number,
  articleCode: string,
  shouldLog: boolean
): number | null {
  let lastPageNumber: number | null = null
  
  if (shouldLog) {
    console.log(`[ArticleExtractor] Scanning for page number after "${articleCode}" starting at index ${startIndex}`)
  }
  
  for (let scanIndex = startIndex; scanIndex < tokens.length; scanIndex++) {
    const scanToken = tokens[scanIndex].trim()
    
    if (shouldLog) {
      console.log(`[ArticleExtractor] Checking token at index ${scanIndex}: "${scanToken}"`)
    }
    
    // Skip eMFC tokens and hyphens
    if (EMFC_PATTERN.test(scanToken) || EMFC_WITH_NUMBER_PATTERN.test(scanToken) || scanToken === "-") {
      if (shouldLog) {
        console.log(`[ArticleExtractor] Skipping token: "${scanToken}"`)
      }
      continue
    }
    
    // Capture numeric token as potential page count
    if (PAGE_COUNT_PATTERN.test(scanToken)) {
      const pageNumber = parseInt(scanToken, 10)
      
      if (shouldLog) {
        console.log(`[ArticleExtractor] Found potential page number: ${pageNumber}`)
      }
      
      if (pageNumber >= 0 && pageNumber <= 10000) {
        lastPageNumber = pageNumber // Remember the last number seen
      }
      continue
    }
    
    // Detect date/time boundaries to stop scanning
    if (isDateTimeBoundary(tokens, scanIndex)) {
      if (shouldLog) {
        console.log(`[ArticleExtractor] ⏹️ Hit date/time boundary at index ${scanIndex}, stopping scan`)
        if (lastPageNumber !== null) {
          console.log(`[ArticleExtractor] ✅ Finalized page number: ${lastPageNumber} (hit date/time boundary)`)
        }
      }
      break
    }
  }
  
  if (shouldLog && lastPageNumber !== null) {
    console.log(`[ArticleExtractor] ✅ Using last number seen: ${lastPageNumber}`)
  } else if (shouldLog && lastPageNumber === null) {
    console.log(`[ArticleExtractor] ⚠️ No valid page number found after "${articleCode}"`)
  }
  
  return lastPageNumber
}

/**
 * Validate and create ArticleData object
 */
function createArticleData(
  articleCode: string,
  pageNumber: number | null,
  source: string | null
): ArticleData | null {
  // Only include if we have a valid page number (0 is valid)
  if (pageNumber === null) {
    return null
  }
  
  // Page number must be between 0 and 10000
  if (pageNumber >= 0 && pageNumber <= 10000) {
    const articleData: ArticleData = {
      articleId: articleCode,
      pageNumber,
    }
    
    if (source) {
      articleData.source = source
    }
    
    return articleData
  }
  
  return null
}

/**
 * Extract article information from raw HTML/text.
 *
 * Focus: Extract ARTICLE IDs, PAGE NUMBERS, and SOURCE (DOCX/TEX).
 *
 * Steps:
 * 1. Clean HTML by removing tags and normalizing whitespace.
 * 2. Split the text into tokens (words/numbers).
 * 3. Identify article IDs using a regex pattern.
 * 4. Detect source (DOCX or TEX) from token after article ID.
 * 5. Scan forward to find page numbers (skipping source codes like TEX, DOCX, eMFC tokens).
 * 6. Only include articles with a valid page number.
 *
 * @param html - Raw HTML/text content.
 * @param emailInfo - Optional email identification for debugging (only logs when provided).
 * @returns Extracted information:
 *   - articles: Array of article data objects containing articleId, pageNumber, and optional source.
 *   - totalFiles: Number of articles found.
 *   - totalPages: Sum of pages across all articles.
 */
export function extractArticleData(
  html: string,
  emailInfo?: { id?: string; subject?: string; from?: string }
): ArticleExtractionResult {
  const shouldLog = !!emailInfo
  const emailIdentifier = emailInfo
    ? `Email: ${emailInfo.subject || emailInfo.id || "Unknown"}${emailInfo.from ? ` (From: ${emailInfo.from})` : ""}`
    : ""

  // Initialize logging
  if (shouldLog) {
    console.group(`🔍 [ArticleExtractor] ${emailIdentifier}`)
    console.log("%c🔍 Article Extraction Starting...", "color: blue; font-weight: bold; font-size: 14px;")
    console.log(`📧 Email ID: ${emailInfo?.id || "N/A"}`)
    console.log(`📊 Original HTML length: ${html?.length || 0} characters`)
    console.log("📋 Email Info:", emailInfo)
  }
  
  // Step 1: Clean HTML content
  const cleanedText = cleanHtmlText(html)
  if (shouldLog) {
    console.log(`📝 Cleaned text length: ${cleanedText.length} characters`)
    console.log("📄 Cleaned text preview (first 500 chars):", cleanedText.substring(0, 500))
  }

  // Step 2: Tokenize text
  const tokens = tokenizeText(cleanedText)
  if (shouldLog) {
    console.log(`🔢 Total tokens: ${tokens.length}`)
    console.log("🔤 First 20 tokens:", tokens.slice(0, 20))
  }

  // Step 3: Iterate through tokens to find articles
  const articles: ArticleData[] = []
  const seenArticleCodes = new Set<string>()  // Prevent duplicates
  let totalPages = 0
  
  if (shouldLog) {
    console.log("🔍 Starting token scan...")
  }
  let potentialArticlesFound = 0
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim()

    // Check if token is an article code
    if (!ARTICLE_ID_PATTERN.test(token)) continue
    
    potentialArticlesFound++
    const articleCode = token.toUpperCase()
    
    if (shouldLog) {
      console.log(`✨ Found potential article ID at index ${i}: "${token}" -> "${articleCode}"`)
    }

    // Skip duplicates
    if (seenArticleCodes.has(articleCode)) {
      if (shouldLog) {
        console.log(`[ArticleExtractor] Skipping duplicate article: "${articleCode}"`)
      }
      continue
    }

    seenArticleCodes.add(articleCode)

    // Step 4: Detect source (DOCX or TEX)
    const source = detectSource(tokens, i)
    if (shouldLog && source) {
      console.log(`[ArticleExtractor] Found source after article: "${source}"`)
    }

    // Step 5: Extract page number
    const pageNumber = extractPageNumber(tokens, i + 1, articleCode, shouldLog)

    // Step 6: Create and add article if valid
    const articleData = createArticleData(articleCode, pageNumber, source)
    
    if (articleData) {
      if (shouldLog) {
        console.log(`[ArticleExtractor] ✅ Adding article: "${articleCode}" with ${articleData.pageNumber} pages${source ? ` (Source: ${source})` : ""}`)
      }
      articles.push(articleData)
      totalPages += articleData.pageNumber
    } else {
      if (shouldLog) {
        console.log(`[ArticleExtractor] ❌ Skipping article "${articleCode}" - invalid page number`)
      }
    }
  }
  
  // Step 7: Log results and return
  if (shouldLog) {
    console.log(`Scan complete. Found ${potentialArticlesFound} potential articles, ${articles.length} valid articles`)
    
    if (articles.length === 0) {
      const matchedTokens = tokens.filter(t => ARTICLE_ID_PATTERN.test(t.trim()))
      console.warn(`❌ No articles found ${emailIdentifier}`)
      console.log("Debug info - tokens that matched ARTICLE_ID_PATTERN:", matchedTokens)
      console.log("Total tokens scanned:", tokens.length)
      console.log("Sample tokens (first 50):", tokens.slice(0, 50))
    } else {
      console.log(`✅ Extraction successful!`)
      console.log("Results:", {
        articleCount: articles.length,
        totalPages,
        articles: articles
      })
    }
    console.groupEnd()
  }

  return {
    articles,
    totalFiles: articles.length,
    totalPages,
  }
}

