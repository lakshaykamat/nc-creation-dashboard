/**
 * Priority Order Utility Functions
 * 
 * Pure utility functions for reordering priority fields based on saved order
 * 
 * @module lib/file-allocator/priority-order-utils
 */

import type { PriorityField } from "@/lib/constants/file-allocator-constants"

/**
 * Reorder priority fields based on saved order
 * 
 * @param fields - Current priority fields
 * @param savedOrder - Array of field IDs in saved order
 * @returns Reordered priority fields
 */
export function reorderPriorityFields(
  fields: PriorityField[],
  savedOrder: string[]
): PriorityField[] {
  // Create a map of fields by ID for quick lookup
  const fieldMap = new Map<string, PriorityField>()
  fields.forEach((field) => {
    fieldMap.set(field.id, field)
  })

  // Reorder fields based on saved order
  const reordered: PriorityField[] = []
  const usedIds = new Set<string>()

  // First, add fields in the saved order
  savedOrder.forEach((id) => {
    const field = fieldMap.get(id)
    if (field) {
      reordered.push(field)
      usedIds.add(id)
    }
  })

  // Then, add any remaining fields that weren't in the saved order (new members)
  fields.forEach((field) => {
    if (!usedIds.has(field.id)) {
      reordered.push(field)
    }
  })

  return reordered
}

/**
 * Extract order (array of IDs) from priority fields
 * 
 * @param fields - Priority fields
 * @returns Array of field IDs in current order
 */
export function extractPriorityOrder(fields: PriorityField[]): string[] {
  return fields.map((field) => field.id)
}

