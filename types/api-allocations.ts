/**
 * API Request/Response Types for Allocations
 * 
 * @module types/api-allocations
 */

import type { AllocatedArticle, ParsedArticle } from "@/types/file-allocator"
import type { PriorityField } from "@/lib/constants/file-allocator-constants"

/**
 * Request body for computing article distribution
 */
export interface ComputeAllocationRequest {
  priorityFields: PriorityField[]
  parsedArticles: ParsedArticle[]
  ddnArticles: string[]
  allocationMethod: string
  month: string
  date: string
}

/**
 * Response from compute allocation API
 */
export interface ComputeAllocationResponse {
  allocatedArticles: AllocatedArticle[]
}

/**
 * Request body for preview/display articles computation
 */
export interface PreviewAllocationRequest {
  priorityFields: PriorityField[]
  parsedArticles: ParsedArticle[]
  ddnArticles: string[]
  allocationMethod: string
  month: string
  date: string
  articleDisplayOverrides?: Record<string, Partial<Pick<AllocatedArticle, "month" | "date" | "name">>>
}

/**
 * Response from preview allocation API
 */
export interface PreviewAllocationResponse {
  allocatedArticles: AllocatedArticle[]
  unallocatedArticles: AllocatedArticle[]
  displayArticles: AllocatedArticle[]
}

/**
 * Request body for validation
 */
export interface ValidateAllocationRequest {
  priorityFields: PriorityField[]
  totalFiles: number
  ddnArticles: string[]
  availableArticleIds: string[]
  ddnText?: string
}

/**
 * Response from validation API
 */
export interface ValidateAllocationResponse {
  isOverAllocated: boolean
  remainingFiles: number
  allocatedFiles: number
  ddnValidationError: string | null
  errors: string[]
}

