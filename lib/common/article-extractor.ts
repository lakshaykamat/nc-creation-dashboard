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

  // Always log to main console, even in sandboxed contexts
  if (shouldLog) {
    // Use console.group instead of groupCollapsed so it's immediately visible
    console.group(`🔍 [ArticleExtractor] ${emailIdentifier}`)
    // Force a visible log message
    console.log("%c🔍 Article Extraction Starting...", "color: blue; font-weight: bold; font-size: 14px;")
    console.log(`📧 Email ID: ${emailInfo?.id || "N/A"}`)
    console.log(`📊 Original HTML length: ${html?.length || 0} characters`)
    console.log("📋 Email Info:", emailInfo)
  }
  
  // --- Step 1: Clean HTML content ---
  const cleanedText = html
    .replace(/<br\s*\/?>/gi, "\n")      // Replace <br> with newline
    .replace(/<\/p>/gi, "\n")           // Replace </p> with newline
    .replace(/<li[^>]*>/gi, "\n")       // Replace <li> with newline
    .replace(/<[^>]+>/g, "")            // Remove all other HTML tags
    .replace(/&nbsp;/gi, " ")          // Convert &nbsp; to space
    .replace(/\r\n/g, "\n")            // Normalize Windows line endings
    .replace(/\n{2,}/g, "\n")          // Collapse multiple newlines
    .trim()                             // Trim leading/trailing whitespace

  if (shouldLog) {
    console.log(`📝 Cleaned text length: ${cleanedText.length} characters`)
    console.log("📄 Cleaned text preview (first 500 chars):", cleanedText.substring(0, 500))
  }

  // --- Step 2: Tokenize text ---
  const tokens = cleanedText.split(/\s+/).filter(Boolean)
  
  if (shouldLog) {
    console.log(`🔢 Total tokens: ${tokens.length}`)
    console.log("🔤 First 20 tokens:", tokens.slice(0, 20))
  }

  // --- Step 3: Use regex to detect article codes ---
  // Initialize storage for results
  const articles: ArticleData[] = []
  const seenArticleCodes = new Set<string>()  // Prevent duplicates
  let totalPages = 0                           // Sum of all pages

  // --- Step 4: Iterate through tokens to find articles ---
  if (shouldLog) {
    console.log("🔍 Starting token scan...")
  }
  let potentialArticlesFound = 0
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim()

    // Check if token is an article code
    if (ARTICLE_ID_PATTERN.test(token)) {
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

      // Initialize tracking for this article
      let pageCount = 0
      let lastPageNumber: number | null = null
      let source: string | null = null
      
      // --- Step 4.5: Detect source (DOCX or TEX) from token after article ID ---
      if (i + 1 < tokens.length) {
        const nextToken = tokens[i + 1].trim().toUpperCase()
        if (nextToken === "DOCX" || nextToken === "TEX") {
          source = nextToken
          if (shouldLog) {
            console.log(`[ArticleExtractor] Found source after article: "${source}"`)
          }
        }
      }
      

      // --- Step 5: Scan forward to find page numbers ---
      // Look for the number immediately following the article ID
      // In table format: ARTICLE_ID SOURCE SOURCE PAGES ...
      // Skip all consecutive source codes, eMFC tokens, etc. until we find a page number
      const nextIndex = i + 1
      
      if (shouldLog) {
        console.log(`[ArticleExtractor] Scanning for page number after "${articleCode}" starting at index ${nextIndex}`)
      }
      
      // Skip all consecutive source codes, eMFC tokens, hyphens, etc. until we find a numeric page number
      const maxScanDistance = 10 // Don't scan too far
      
      for (let scanIndex = nextIndex; scanIndex < tokens.length && scanIndex < i + maxScanDistance; scanIndex++) {
        const scanToken = tokens[scanIndex].trim()
        
        if (shouldLog) {
          console.log(`[ArticleExtractor] Checking token at index ${scanIndex}: "${scanToken}"`)
        }
        
        // Skip eMFC tokens, hyphens, and source codes
        const isEmfc = EMFC_PATTERN.test(scanToken) || EMFC_WITH_NUMBER_PATTERN.test(scanToken)
        const isHyphen = scanToken === "-"
        const isSourceCode = SOURCE_CODE_PATTERN.test(scanToken) && !PAGE_COUNT_PATTERN.test(scanToken)
        
        if (isEmfc || isHyphen || isSourceCode) {
          if (shouldLog) {
            console.log(`[ArticleExtractor] Skipping token: "${scanToken}" (${isEmfc ? "eMFC" : isHyphen ? "hyphen" : "source code"})`)
          }
          continue
        }
        
        // Check if this token is a numeric page number
        if (PAGE_COUNT_PATTERN.test(scanToken)) {
          const pageNumber = parseInt(scanToken, 10)
          
          if (shouldLog) {
            console.log(`[ArticleExtractor] Found page number: ${pageNumber} at index ${scanIndex}`)
          }
          
          if (pageNumber >= 0 && pageNumber <= 10000) {
            lastPageNumber = pageNumber
            pageCount = pageNumber
            
            if (shouldLog) {
              console.log(`[ArticleExtractor] ✅ Valid page number set: ${pageCount}`)
            }
            break // Found page number, stop scanning
          } else {
            if (shouldLog) {
              console.log(`[ArticleExtractor] Page number out of range: ${pageNumber}`)
            }
          }
        } else {
          // If we encounter a non-numeric token that's not a source code/eMFC, continue scanning
          if (shouldLog) {
            console.log(`[ArticleExtractor] Token is not numeric, continuing scan: "${scanToken}"`)
          }
        }
      }
      
      if (lastPageNumber === null && shouldLog) {
        console.log(`[ArticleExtractor] ⚠️ No valid page number found after "${articleCode}"`)
      }

      // --- Step 6: Add article if page number is valid ---
      if ((lastPageNumber !== null && pageCount !== 0) || lastPageNumber === 0) {
        if (shouldLog) {
          console.log(`[ArticleExtractor] ✅ Adding article: "${articleCode}" with ${pageCount} pages${source ? ` (Source: ${source})` : ""}`)
        }
        
        const articleData: ArticleData = {
          articleId: articleCode,
          pageNumber: pageCount,
        }
        
        if (source) {
          articleData.source = source
        }
        
        articles.push(articleData)
        totalPages += pageCount
      } else {
        if (shouldLog) {
          console.log(`[ArticleExtractor] ❌ Skipping article "${articleCode}" - invalid page number (lastPageNumber: ${lastPageNumber}, pageCount: ${pageCount})`)
        }
      }
    }
  }
  
  if (shouldLog) {
    console.log(`Scan complete. Found ${potentialArticlesFound} potential articles, ${articles.length} valid articles`)
  }

  // --- Step 7: Return result object ---
  if (shouldLog) {
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

