/**
 * Priority Order Storage Utility Functions
 * 
 * Pure utility functions for saving and loading priority field order from localStorage
 * 
 * @module lib/file-allocator/priority-order-storage-utils
 */

const STORAGE_KEY = "file-allocator-priority-order"

/**
 * Save priority field order to localStorage
 * 
 * @param order - Array of field IDs in the desired order
 */
export function savePriorityOrder(order: string[]): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
    }
  } catch (error) {
    console.warn("Failed to save priority order to localStorage:", error)
  }
}

/**
 * Load priority field order from localStorage
 * 
 * @returns Array of field IDs in saved order, or null if not found
 */
export function loadPriorityOrder(): string[] | null {
  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
          return parsed
        }
      }
    }
  } catch (error) {
    console.warn("Failed to load priority order from localStorage:", error)
  }
  return null
}

/**
 * Clear priority order from localStorage
 */
export function clearPriorityOrder(): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    console.warn("Failed to clear priority order from localStorage:", error)
  }
}

