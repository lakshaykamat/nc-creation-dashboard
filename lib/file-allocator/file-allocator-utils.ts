/**
 * Pure Utility Functions for Article Allocation Form
 * 
 * This module contains only pure utility functions (no business logic):
 * - Parsing article data from various formats
 * - Validating DDN articles
 * - Calculating allocation metrics
 * 
 * Note: Business logic (allocation rules, distribution algorithms) is in hooks.
 * All functions are pure (no side effects) and well-documented.
 * 
 * @module lib/file-allocator-utils
 */

import { type PriorityField } from "./file-allocator-constants"
import type { ParsedArticle, DdnValidationResult } from "@/types/file-allocator"

// Re-export for backward compatibility
export type { ParsedArticle, DdnValidationResult }

/**
 * Calculates the total number of articles allocated across all priority fields.
 * 
 * @param priorityFields - Array of priority fields with allocation counts
 * @returns Total number of articles allocated
 * 
 * @example
 * ```ts
 * const fields = [
 *   { id: "1", label: "Ruchi", value: 5 },
 *   { id: "2", label: "Karishma", value: 3 }
 * ]
 * const total = calculateAllocatedFiles(fields) // Returns: 8
 * ```
 */
export function calculateAllocatedFiles(priorityFields: PriorityField[]): number {
  return priorityFields.reduce((sum, field) => sum + (field.value || 0), 0)
}

/**
 * Calculates the number of articles remaining to be allocated.
 * 
 * @param totalFiles - Total number of articles available
 * @param allocatedFiles - Number of articles already allocated
 * @returns Number of remaining articles (can be negative if over-allocated)
 * 
 * @example
 * ```ts
 * const remaining = calculateRemainingFiles(10, 7) // Returns: 3
 * const over = calculateRemainingFiles(10, 12) // Returns: -2
 * ```
 */
export function calculateRemainingFiles(
  totalFiles: number,
  allocatedFiles: number
): number {
  return totalFiles - allocatedFiles
}

/**
 * Checks if the allocation exceeds the available number of articles.
 * 
 * @param totalFiles - Total number of articles available
 * @param allocatedFiles - Number of articles allocated
 * @returns True if over-allocated, false otherwise
 * 
 * @example
 * ```ts
 * isOverAllocated(10, 12) // Returns: true
 * isOverAllocated(10, 8) // Returns: false
 * isOverAllocated(0, 5) // Returns: false (no articles available)
 * ```
 */
export function isOverAllocated(totalFiles: number, allocatedFiles: number): boolean {
  return allocatedFiles > totalFiles && totalFiles > 0
}

/**
 * Generates a user-friendly error message for over-allocation.
 * 
 * @param overBy - Number of articles over-allocated
 * @returns Formatted error message
 * 
 * @example
 * ```ts
 * getOverAllocationMessage(1) // "You are allocating 1 more article than available."
 * getOverAllocationMessage(5) // "You are allocating 5 more articles than available."
 * ```
 */
export function getOverAllocationMessage(overBy: number): string {
  return `You are allocating ${overBy} more article${overBy !== 1 ? "s" : ""} than available.`
}

/**
 * Calculates the new total allocated count when a specific field value changes.
 * Used for real-time validation during form input.
 * 
 * @param priorityFields - Array of all priority fields
 * @param fieldId - ID of the field being changed
 * @param newValue - New value for the field
 * @returns New total allocated count
 * 
 * @example
 * ```ts
 * const fields = [
 *   { id: "1", label: "Ruchi", value: 5 },
 *   { id: "2", label: "Karishma", value: 3 }
 * ]
 * const newTotal = calculateNewAllocatedTotal(fields, "1", 7) // Returns: 10
 * ```
 */
export function calculateNewAllocatedTotal(
  priorityFields: PriorityField[],
  fieldId: string,
  newValue: number
): number {
  return priorityFields.reduce((sum, field) => {
    if (field.id === fieldId) return sum + newValue
    return sum + (field.value || 0)
  }, 0)
}


/**
 * Parses the newArticlesWithPages array into structured article data.
 * 
 * Expected format: "ARTICLE_ID [PAGES]" (e.g., "CDC101217 [24]")
 * 
 * @param newArticlesWithPages - Array of article strings in format "ID [PAGES]"
 * @returns Array of parsed articles with articleId and pages
 * 
 * @example
 * ```ts
 * const input = ["CDC101217 [24]", "EA147928 [29]", "TWST114323 [0]"]
 * const parsed = parseNewArticlesWithPages(input)
 * // Returns: [
 * //   { articleId: "CDC101217", pages: 24 },
 * //   { articleId: "EA147928", pages: 29 },
 * //   { articleId: "TWST114323", pages: 0 }
 * // ]
 * ```
 */
export function parseNewArticlesWithPages(
  newArticlesWithPages?: string[] | null
): ParsedArticle[] {
  if (!newArticlesWithPages || newArticlesWithPages.length === 0) {
    return []
  }

  return newArticlesWithPages.map((entry) => {
    // Match format: "ARTICLE_ID [PAGES]"
    const match = entry.match(/^([^\s\[]+)\s*\[(\d+)\]/)
    const articleId = match?.[1] ?? entry.trim()
    const pages = match ? Number(match[2]) || 0 : 0

    return { articleId, pages }
  })
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
 * 
 * @example
 * ```ts
 * const text = "CDC101217\nEA147928\nCDC101217" // Duplicate
 * const available = ["CDC101217", "EA147928", "TWST114323"]
 * const result = validateDdnArticles(text, available)
 * // Returns: { articles: [], error: "DDN articles must be unique..." }
 * 
 * const validText = "CDC101217\nEA147928"
 * const validResult = validateDdnArticles(validText, available)
 * // Returns: { articles: ["CDC101217", "EA147928"], error: null }
 * ```
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


