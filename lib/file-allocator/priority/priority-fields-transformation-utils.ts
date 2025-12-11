/**
 * Priority Fields Transformation Utility Functions
 * 
 * Pure utility functions for transforming data to priority fields format
 * 
 * @module lib/file-allocator/priority-fields-transformation-utils
 */

import { createInitialPriorityFields } from "@/lib/constants/file-allocator-constants"
import type { PriorityField } from "@/lib/constants/file-allocator-constants"

/**
 * Transform team members to priority fields format
 * 
 * @param teamMembers - Array of team members with id and label
 * @returns Array of priority fields
 */
export function transformTeamMembersToPriorityFields(
  teamMembers: Array<{ id: string; label: string }>
): PriorityField[] {
  return createInitialPriorityFields(teamMembers)
}

