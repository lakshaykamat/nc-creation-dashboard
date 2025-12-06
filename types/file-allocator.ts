/**
 * Type definitions for File Allocator feature
 * 
 * @module types/file-allocator
 */

import type { Control, UseFormWatch, UseFormSetValue } from "react-hook-form"
import type { PriorityField } from "@/lib/file-allocator/file-allocator-constants"

/**
 * Form values structure for Article Allocation Form
 */
export interface FormValues {
  allocationMethod: string
  ddnArticles: string
  priorityFields: PriorityField[]
}

/**
 * Represents an article allocated to a person or DDN.
 */
export interface AllocatedArticle {
  /** Name of the person or "DDN" for DDN articles */
  name: string
  /** Article identifier */
  articleId: string
  /** Number of pages */
  pages: number
  /** Month name (e.g., "December") */
  month: string
  /** Date in DD/MM/YYYY format */
  date: string
}

/**
 * Represents articles allocated to a specific person.
 */
export interface PersonAllocation {
  /** Person name */
  person: string
  /** Array of articles allocated to this person */
  articles: Array<{
    articleId: string
    pages: number
    month: string
    date: string
  }>
}

/**
 * Final allocation result structure for form submission.
 */
export interface FinalAllocationResult {
  /** Articles grouped by person */
  personAllocations: PersonAllocation[]
  /** DDN articles with pages */
  ddnArticles: Array<{
    articleId: string
    pages: number
    month: string
    date: string
  }>
  /** Articles that were not allocated to anyone */
  unallocatedArticles: Array<{
    articleId: string
    pages: number
    month: string
    date: string
  }>
}

/**
 * Return type for useFileAllocatorFormState hook
 * 
 * Note: The actual type definition with complex ReturnType references
 * is kept in the hook file (use-file-allocator-form-state.ts).
 * Import it directly from there when needed.
 */

/**
 * Result of DDN article validation.
 */
export interface DdnValidationResult {
  /** Array of valid, unique article IDs */
  articles: string[]
  /** Error message if validation failed, null if valid */
  error: string | null
}

/**
 * Parsed article data structure.
 */
export interface ParsedArticle {
  /** Article identifier (e.g., "CDC101217") */
  articleId: string
  /** Number of pages */
  pages: number
}

/**
 * Response from article detection API
 */
export interface DetectArticlesResponse {
  existingSheetArticles: string[]
  emailArticles: string[]
  newArticleIds: string[]
  totalNewArticles: number
  newArticlesWithPages: string[]
  totalNewPages: number
  html: string
  emailDate: string
}

/**
 * Error type for file allocator operations
 */
export type FileAllocatorError = {
  code?: number
  message: string
  hint?: string
}

/**
 * Transformed allocation item for webhook submission
 */
export interface AllocationItem {
  Month: string
  Date: string
  "Article number": string
  Pages: number
  Completed: string
  "Done by": string
  Time: string
}

