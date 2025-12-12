/**
 * Hook for managing email selection state
 * 
 * @module hooks/emails/use-email-selection
 */

import { useState, useCallback } from "react"
import type { Email } from "@/types/emails"

/**
 * Manages email selection state for list and detail views
 * 
 * Provides state management for:
 * - Single email selection (for detail view)
 * - Multiple email ID selection (for bulk operations)
 * 
 * Uses Set for efficient ID lookups and toggling. Handlers are memoized
 * with useCallback to prevent unnecessary re-renders.
 * 
 * @returns Object containing:
 *   - selectedEmail: Currently selected email for detail view (null if none)
 *   - selectedEmailIds: Set of selected email IDs for bulk operations
 *   - setSelectedEmail/setSelectedEmailIds: Direct setters
 *   - handleSelectEmail: Function to select an email for detail view
 *   - handleBackToList: Function to clear selection and return to list
 *   - handleToggleEmailSelection: Function to toggle email ID in selection set
 */
export function useEmailSelection() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set())

  const handleSelectEmail = useCallback((email: Email) => {
    setSelectedEmail(email)
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedEmail(null)
  }, [])

  const handleToggleEmailSelection = useCallback((emailId: string) => {
    setSelectedEmailIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(emailId)) {
        newSet.delete(emailId)
      } else {
        newSet.add(emailId)
      }
      return newSet
    })
  }, [])

  return {
    selectedEmail,
    selectedEmailIds,
    setSelectedEmail,
    setSelectedEmailIds,
    handleSelectEmail,
    handleBackToList,
    handleToggleEmailSelection,
  }
}

