/**
 * Custom hook for setting document title
 * 
 * Reduces duplication across pages
 * 
 * @module hooks/common/use-document-title
 */

import { useEffect } from "react"

/**
 * Hook to set document title
 * @param title - The title to set (will be appended with " | NC Creation")
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | NC Creation`
  }, [title])
}

