/**
 * Article Extractor Utility
 * 
 * Extracts article information from raw HTML/text content.
 * 
 * @module lib/common/article-extractor
 */

/**
 * Result object returned by extractArticleData function
 */
export interface ArticleExtractionResult {
  articleNumbers: string[]
  totalFiles: number
  totalPages: number
  articlePageCounts: Record<string, number>
  formattedArticleEntries: string[]
  hasArticles: boolean
}

/**
 * Extract article information from raw HTML/text.
 *
 * Steps:
 * 1. Clean HTML by removing tags and normalizing whitespace.
 * 2. Split the text into tokens (words/numbers/dates).
 * 3. Identify article codes using a regex pattern.
 * 4. Scan forward in each article block to find page numbers.
 * 5. Only include articles with a valid page number.
 *
 * @param html - Raw HTML/text content.
 * @returns Extracted information:
 *   - articleNumbers: Array of article codes found.
 *   - totalFiles: Number of articles found.
 *   - totalPages: Sum of pages across all articles.
 *   - articlePageCounts: Map of article code → page count.
 *   - formattedArticleEntries: Array of formatted strings like "ARTICLE [pages]".
 *   - hasArticles: Boolean flag indicating if any articles were found.
 */
export function extractArticleData(html: string): ArticleExtractionResult {
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

  // --- Step 2: Tokenize text ---
  const tokens = cleanedText.split(/\s+/).filter(Boolean)

  // --- Step 3: Define regex to detect article codes ---
  const ARTICLE_CODE_PATTERN = /^[A-Z]{2,}[A-Z0-9]*\d$/

  // Initialize storage for results
  const articleNumbers: string[] = []
  const seenArticleCodes = new Set<string>()  // Prevent duplicates
  const articlePageCounts: Record<string, number> = {}  // Map article code → page count
  let totalPages = 0                           // Sum of all pages
  const formattedArticleEntries: string[] = []  // Formatted strings like "ARTICLE [pages]"

  // --- Step 4: Iterate through tokens to find articles ---
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim()

    // Check if token is an article code
    if (ARTICLE_CODE_PATTERN.test(token)) {
      const articleCode = token.toUpperCase()

      // Skip duplicates
      if (seenArticleCodes.has(articleCode)) continue

      seenArticleCodes.add(articleCode)

      // Initialize page tracking for this article
      let pageCount = 0
      let lastPageNumber: number | null = null

      // --- Step 5: Scan forward to find page numbers ---
      for (let j = i + 1; j < tokens.length; j++) {
        const nextToken = tokens[j].trim()

        // Skip eMFC tokens or hyphen placeholders
        if (/^eMFC$/i.test(nextToken) || /^eMFC[-:]\d+$/i.test(nextToken) || nextToken === "-") continue

        // Capture numeric token as potential page count
        if (/^\d+$/.test(nextToken)) {
          const pageNumber = parseInt(nextToken, 10)
          if (pageNumber >= 0 && pageNumber <= 10000) lastPageNumber = pageNumber   // Allow 0 as valid page
        }

        // Detect dates to identify end of block
        const datePatternSlash = /^\d{1,2}\/\d{1,2}\/\d{4}$/
        const datePatternDash = /^\d{1,2}-\d{1,2}-\d{4}$/
        const timePattern = /^\d{1,2}:\d{2}$/

        // If a date is found followed by a time, finalize page count
        if ((datePatternSlash.test(nextToken) || datePatternDash.test(nextToken)) && timePattern.test(tokens[j + 1] || "")) {
          if (lastPageNumber !== null) pageCount = lastPageNumber
          break // End of article block
        }

        // End scan if time appears alone
        if (timePattern.test(nextToken)) break
      }

      // --- Step 6: Add article if page number is valid ---
      if ((lastPageNumber !== null && pageCount !== 0) || lastPageNumber === 0) {
        articleNumbers.push(articleCode)
        articlePageCounts[articleCode] = pageCount
        totalPages += pageCount
        formattedArticleEntries.push(`${articleCode} [${pageCount}]`)
      }
    }
  }

  // --- Step 7: Return result object ---
  if (articleNumbers.length === 0) {
    return {
      articleNumbers: [],
      totalFiles: 0,
      totalPages: 0,
      articlePageCounts: {},
      formattedArticleEntries: [],
      hasArticles: false,
    }
  }

  return {
    articleNumbers,
    totalFiles: articleNumbers.length,
    totalPages,
    articlePageCounts,
    formattedArticleEntries,
    hasArticles: true,
  }
}

