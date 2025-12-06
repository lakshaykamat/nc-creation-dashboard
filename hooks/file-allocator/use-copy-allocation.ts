/**
 * Hook for copying allocation data to clipboard
 * 
 * Formats allocation data as "ARTICLE ID NAME" sorted by name.
 * 
 * @module hooks/file-allocator/use-copy-allocation
 */

import { useState } from "react"
import type { FinalAllocationResult } from "@/types/file-allocator"

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

  // Add unallocated articles
  allocation.unallocatedArticles.forEach((article) => {
    articles.push({
      articleId: article.articleId,
      name: "NEED TO ALLOCATE",
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
    if (!allocation) {
      console.warn("No allocation data to copy")
      return
    }

    const textToCopy = formatAllocationForCopy(allocation)
    
    if (!textToCopy || textToCopy.trim().length === 0) {
      console.warn("No text to copy - allocation may be empty")
      return
    }

    // Helper function to use fallback copy method
    const fallbackCopy = (): boolean => {
      try {
        // Try to focus the window first (may help with some browsers)
        if (window.focus) {
          window.focus()
        }
        
        // Create a temporary textarea element
        const textArea = document.createElement("textarea")
        textArea.value = textToCopy
        textArea.style.position = "fixed"
        textArea.style.left = "0"
        textArea.style.top = "0"
        textArea.style.width = "2em"
        textArea.style.height = "2em"
        textArea.style.padding = "0"
        textArea.style.border = "none"
        textArea.style.outline = "none"
        textArea.style.boxShadow = "none"
        textArea.style.background = "transparent"
        textArea.style.opacity = "0"
        textArea.setAttribute("readonly", "")
        textArea.setAttribute("aria-hidden", "true")
        
        document.body.appendChild(textArea)
        
        // Focus and select the text
        textArea.focus()
        
        // Select the text
        if (navigator.userAgent.match(/ipad|iphone/i)) {
          // iOS specific handling
          const range = document.createRange()
          range.selectNodeContents(textArea)
          const selection = window.getSelection()
          selection?.removeAllRanges()
          selection?.addRange(range)
          textArea.setSelectionRange(0, 999999)
        } else {
          textArea.select()
          textArea.setSelectionRange(0, 999999)
        }
        
        // Try to copy
        let successful = false
        try {
          successful = document.execCommand("copy")
        } catch (err) {
          console.warn("execCommand copy failed:", err)
        }
        
        // Clean up
        document.body.removeChild(textArea)
        
        return successful
      } catch (err) {
        console.error("Fallback copy setup failed:", err)
        return false
      }
    }

    try {
      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        // Fallback for older browsers
        const success = fallbackCopy()
        if (success) {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
        return
      }

      // Try clipboard API first
      try {
        await navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        return
      } catch (clipboardErr) {
        // If clipboard API fails (e.g., document not focused), use fallback
        console.warn("Clipboard API failed, using fallback method:", clipboardErr)
      }
      
      // Try fallback method
      const success = fallbackCopy()
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        // If both methods fail, still set copied state to show user they can manually copy
        // The text is available in the button or we can show it in a message
        console.warn("Both copy methods failed - user may need to manually copy")
        // Still set copied to true so UI shows feedback, even if copy didn't work
        // User can click the button to try again
        setCopied(false)
      }
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      // Last resort: try fallback
      const success = fallbackCopy()
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        setCopied(false)
      }
    }
  }

  return {
    copy,
    copied,
  }
}

