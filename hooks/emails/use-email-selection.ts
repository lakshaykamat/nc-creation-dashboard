/**
 * Hook for managing email selection state
 * 
 * @module hooks/emails/use-email-selection
 */

import { useState, useCallback } from "react"
import type { Email } from "@/types/emails"

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

