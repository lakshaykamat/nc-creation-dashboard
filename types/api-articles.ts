/**
 * API Request/Response Types for Articles
 * 
 * @module types/api-articles
 */

import type { ParsedArticle } from "@/types/file-allocator"

/**
 * Request body for parsing article data
 */
export interface ParseArticlesRequest {
  newArticlesWithPages: string[]
}

/**
 * Response from parse articles API
 */
export interface ParseArticlesResponse {
  parsedArticles: ParsedArticle[]
}

/**
 * Request body for parsing pasted allocation data
 */
export interface ParsePastedAllocationRequest {
  pastedText: string
}

/**
 * Response from parse pasted allocation API
 */
export interface ParsePastedAllocationResponse {
  entries: Array<{
    articleId: string
    pages: number
  }>
}

