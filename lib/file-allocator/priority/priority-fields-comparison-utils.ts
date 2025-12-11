/**
 * Priority Fields Comparison Utility Functions
 * 
 * Pure utility functions for comparing priority fields
 * 
 * @module lib/file-allocator/priority-fields-comparison-utils
 */

import type { PriorityField } from "@/lib/constants/file-allocator-constants"

/**
 * Extract sorted labels from priority fields
 * 
 * @param fields - Array of priority fields
 * @returns Sorted comma-separated string of labels
 */
function extractSortedLabels(fields: PriorityField[]): string {
  return fields.map(f => f.label).sort().join(",")
}

/**
 * Check if priority fields have changed by comparing labels
 * 
 * @param currentFields - Current priority fields
 * @param newFields - New priority fields to compare
 * @returns True if fields have changed, false otherwise
 */
export function hasPriorityFieldsChanged(
  currentFields: PriorityField[],
  newFields: PriorityField[]
): boolean {
  const currentLabels = extractSortedLabels(currentFields)
  const newLabels = extractSortedLabels(newFields)
  return currentLabels !== newLabels
}

