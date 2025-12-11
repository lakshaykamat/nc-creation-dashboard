/**
 * Allocation Validation Utility Functions
 * 
 * Pure utility functions for validating allocation data
 * 
 * @module lib/file-allocator/allocation-validation-utils
 */

import type { DdnValidationResult } from "@/types/file-allocator"

// Re-export for backward compatibility
export type { DdnValidationResult }

/**
 * Checks if the allocation exceeds the available number of articles.
 * 
 * @param totalFiles - Total number of articles available
 * @param allocatedFiles - Number of articles allocated
 * @returns True if over-allocated, false otherwise
 */
export function isOverAllocated(totalFiles: number, allocatedFiles: number): boolean {
  return allocatedFiles > totalFiles && totalFiles > 0
}

/**
 * Parses and validates DDN (Direct Data Network) article textarea content.
 * 
 * Validation rules:
 * - Accepts one article ID per line
 * - Ensures all article IDs are unique (no duplicates)
 * - Ensures each article ID exists in the available article IDs list
 * 
 * @param text - Textarea content (one article ID per line)
 * @param availableArticleIds - Array of valid article IDs from form data
 * @returns Validation result with parsed articles and error message (if any)
 */
export function validateDdnArticles(
  text: string,
  availableArticleIds: string[]
): DdnValidationResult {
  const rawLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (rawLines.length === 0) {
    return { articles: [], error: null }
  }

  // If no available articles, skip validation (allow any input)
  if (availableArticleIds.length === 0) {
    // Still check for uniqueness
    const unique = new Set(rawLines)
    if (unique.size !== rawLines.length) {
      return {
        articles: [],
        error: "DDN articles must be unique. Remove duplicate article IDs.",
      }
    }
    return { articles: rawLines, error: null }
  }

  // Ensure uniqueness first
  const unique = new Set(rawLines)
  if (unique.size !== rawLines.length) {
    return {
      articles: [],
      error: "DDN articles must be unique. Remove duplicate article IDs.",
    }
  }

  // Ensure all DDN articles exist in available article IDs
  const missing = rawLines.filter(
    (line) => !availableArticleIds.includes(line)
  )
  if (missing.length > 0) {
    return {
      articles: [],
      error: "Some DDN articles are not present in the new allocation list.",
    }
  }

  return { articles: rawLines, error: null }
}

