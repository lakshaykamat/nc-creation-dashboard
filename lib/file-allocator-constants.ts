/**
 * Constants and Types for Article Allocation Form
 * 
 * This module contains:
 * - Type definitions for form data structures
 * - Default people/team members list
 * - Allocation method constants and options
 * - Helper functions for creating initial form state
 * 
 * @module lib/file-allocator-constants
 */

/**
 * Represents a priority field in the allocation form.
 * Each field corresponds to a team member with their allocation count.
 */
export interface PriorityField {
  /** Unique identifier for the field */
  id: string
  /** Display label (person name) */
  label: string
  /** Number of articles allocated to this person */
  value: number
}

/**
 * Default list of team members available for article allocation.
 * Each person has an ID and label, but no initial allocation value.
 */
export const DEFAULT_PEOPLE: Omit<PriorityField, "value">[] = [
  { id: "1", label: "Ruchi" },
  { id: "2", label: "Karishma" },
  { id: "3", label: "Amiti" },
  { id: "4", label: "Anuradha" },
  { id: "5", label: "Ncxml" },
]

/**
 * Allocation method constants.
 * These values are used throughout the application to identify allocation strategies.
 */
export const ALLOCATION_METHODS = {
  /** Allocates the N largest articles (by page count) to each person */
  BY_PAGES: "allocate by pages",
  /** Allocates articles in priority order (first N available articles) */
  BY_PRIORITY: "allocate by priority",
} as const

/**
 * Allocation method options for dropdown/select components.
 * Each option has a value (from ALLOCATION_METHODS) and a user-friendly label.
 */
export const ALLOCATION_METHOD_OPTIONS = [
  { value: ALLOCATION_METHODS.BY_PAGES, label: "Allocate by Pages" },
  { value: ALLOCATION_METHODS.BY_PRIORITY, label: "Allocate by Priority" },
] as const

/**
 * Creates initial priority fields with default values (0 articles per person).
 * 
 * This function is used to initialize the form state with all team members
 * having zero allocated articles.
 * 
 * @returns Array of priority fields with default values
 * 
 * @example
 * ```ts
 * const fields = createInitialPriorityFields()
 * // Returns: [
 * //   { id: "1", label: "Ruchi", value: 0 },
 * //   { id: "2", label: "Karishma", value: 0 },
 * //   ...
 * // ]
 * ```
 */
export function createInitialPriorityFields(): PriorityField[] {
  return DEFAULT_PEOPLE.map((person) => ({
    ...person,
    value: 0,
  }))
}

