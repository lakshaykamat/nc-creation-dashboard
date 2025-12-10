/**
 * Hook for article allocation
 * 
 * @module hooks/emails/use-article-allocation
 */

import { useState } from "react"
import { extractUniqueArticlesFromEmail } from "@/lib/emails/article-allocation-utils"
import type { Email } from "@/types/emails"

interface AllocationPayload {
  newArticlesWithPages: string[]
}

/**
 * Allocate articles to the system
 */
async function allocateArticles(payload: AllocationPayload): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_NC_API_KEY
  
  const response = await fetch("https://n8n-ex6e.onrender.com/webhook/allocations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey || "",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to allocate articles" }))
    throw new Error(error.message || "Failed to allocate articles")
  }
}

/**
 * Hook to handle article allocation
 */
export function useArticleAllocation() {
  const [isAllocating, setIsAllocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allocate = async (email: Email) => {
    setIsAllocating(true)
    setError(null)

    try {
      const { formattedEntries } = extractUniqueArticlesFromEmail(email)
      
      if (formattedEntries.length === 0) {
        throw new Error("No articles found to allocate")
      }

      await allocateArticles({
        newArticlesWithPages: formattedEntries,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to allocate articles"
      setError(message)
      throw err
    } finally {
      setIsAllocating(false)
    }
  }

  const allocateMultiple = async (emails: Email[]) => {
    setIsAllocating(true)
    setError(null)

    try {
      // Collect all unique articles from all selected emails
      const allArticles = new Set<string>()
      const articlePageMap = new Map<string, number>()

      for (const email of emails) {
        const { articleNumbers, pageMap } = extractUniqueArticlesFromEmail(email)
        
        articleNumbers.forEach((article) => {
          if (!allArticles.has(article)) {
            allArticles.add(article)
            articlePageMap.set(article, pageMap[article] || 0)
          }
        })
      }

      if (allArticles.size === 0) {
        throw new Error("No articles found to allocate")
      }

      // Build formatted entries
      const formattedEntries = Array.from(allArticles).map((article) => {
        const pages = articlePageMap.get(article) || 0
        return `${article} [${pages}]`
      })

      await allocateArticles({
        newArticlesWithPages: formattedEntries,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to allocate articles"
      setError(message)
      throw err
    } finally {
      setIsAllocating(false)
    }
  }

  return {
    allocate,
    allocateMultiple,
    isAllocating,
    error,
  }
}

