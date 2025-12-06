/**
 * Hook for copying allocation data to clipboard
 * 
 * Formats allocation data as "ARTICLE ID NAME" sorted by name.
 * 
 * @module hooks/file-allocator/use-copy-allocation
 */

import { useState } from "react"
import type { FinalAllocationResult } from "./use-file-allocator-form-state"

/**
 * Formats allocation data for copying to clipboard
 * 
 * @param allocation - The allocation result to format
 * @returns Formatted string ready to copy
 */
function formatAllocationForCopy(allocation: FinalAllocationResult): string {
  // Collect all allocated articles with their names
  const articles: Array<{ articleId: string; name: string }> = []

  // Add person allocations
  allocation.personAllocations.forEach((personAlloc) => {
    personAlloc.articles.forEach((article) => {
      articles.push({
        articleId: article.articleId,
        name: personAlloc.person,
      })
    })
  })

  // Add DDN articles
  allocation.ddnArticles.forEach((article) => {
    articles.push({
      articleId: article.articleId,
      name: "DDN",
    })
  })

  // Sort by name, then by articleId
  articles.sort((a, b) => {
    const nameA = a.name.toLowerCase()
    const nameB = b.name.toLowerCase()
    if (nameA !== nameB) {
      return nameA.localeCompare(nameB)
    }
    return a.articleId.localeCompare(b.articleId)
  })

  // Format: ARTICLE ID NAME (one per line)
  return articles
    .map((article) => `${article.articleId} ${article.name}`)
    .join("\n")
}

/**
 * Hook for copying allocation data to clipboard
 * 
 * @param allocation - Optional allocation data to copy
 * @returns Object with copy function and copied state
 */
export function useCopyAllocation(allocation?: FinalAllocationResult) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!allocation) return

    const textToCopy = formatAllocationForCopy(allocation)

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return {
    copy,
    copied,
  }
}

