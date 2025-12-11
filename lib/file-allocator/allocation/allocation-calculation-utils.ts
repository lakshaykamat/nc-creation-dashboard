/**
 * Allocation Calculation Utility Functions
 * 
 * Pure utility functions for calculating allocation metrics
 * 
 * @module lib/file-allocator/allocation-calculation-utils
 */

import type { PriorityField } from "@/lib/constants/file-allocator-constants"

/**
 * Calculates the total number of articles allocated across all priority fields.
 * 
 * @param priorityFields - Array of priority fields with allocation counts
 * @returns Total number of articles allocated
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
 */
export function calculateRemainingFiles(
  totalFiles: number,
  allocatedFiles: number
): number {
  return totalFiles - allocatedFiles
}

/**
 * Calculates the new total allocated count when a specific field value changes.
 * Used for real-time validation during form input.
 * 
 * @param priorityFields - Array of all priority fields
 * @param fieldId - ID of the field being changed
 * @param newValue - New value for the field
 * @returns New total allocated count
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

