/**
 * API Client Functions for Allocations
 * 
 * Client-side functions to call allocation API endpoints
 * 
 * @module lib/api/allocations-api
 */

import { getApiHeaders } from "@/lib/api/api-client"
import type { ComputeAllocationRequest, ComputeAllocationResponse, PreviewAllocationRequest, PreviewAllocationResponse, ValidateAllocationRequest, ValidateAllocationResponse } from "@/types/api-allocations"
import type { FinalAllocationResult } from "@/types/file-allocator"

/**
 * Compute article distribution
 */
export async function computeAllocation(request: ComputeAllocationRequest): Promise<ComputeAllocationResponse> {
  const response = await fetch("/api/allocations/compute", {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(request),
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to compute allocation" }))
    throw new Error(error.message || "Failed to compute allocation")
  }

  return response.json()
}

/**
 * Compute preview/display articles
 */
export async function previewAllocation(request: PreviewAllocationRequest): Promise<PreviewAllocationResponse> {
  const response = await fetch("/api/allocations/preview", {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(request),
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to compute preview" }))
    throw new Error(error.message || "Failed to compute preview")
  }

  return response.json()
}

/**
 * Validate allocation
 */
export async function validateAllocation(request: ValidateAllocationRequest): Promise<ValidateAllocationResponse> {
  const response = await fetch("/api/allocations/validate", {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(request),
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to validate allocation" }))
    throw new Error(error.message || "Failed to validate allocation")
  }

  return response.json()
}

/**
 * Submit allocation
 */
export async function submitAllocation(allocation: FinalAllocationResult): Promise<{ success: boolean; message: string; itemCount: number }> {
  const response = await fetch("/api/allocations", {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(allocation),
    credentials: "include",
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to submit allocation")
  }

  return result
}

