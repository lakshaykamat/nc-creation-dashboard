/**
 * Hook for article allocation
 * 
 * @module hooks/emails/use-article-allocation
 */

import { useState } from "react"
import { extractUniqueArticlesFromEmail } from "@/lib/emails/articles/article-extraction-from-email-utils"
import { extractUniqueArticlesFromMultipleEmails } from "@/lib/emails/articles/article-extraction-from-multiple-emails-utils"
import type { Email, AllocationPayload } from "@/types/emails"
import { N8N_WEBHOOK_ENDPOINTS } from "@/lib/constants/n8n-webhook-constants"

/**
 * Sends allocation payload to n8n webhook
 */
async function allocateArticles(payload: AllocationPayload): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_NC_API_KEY
  
  const response = await fetch(N8N_WEBHOOK_ENDPOINTS.ALLOCATIONS, {
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
 * Manages article allocation state and operations
 * 
 * Provides functions to allocate articles from single or multiple emails by
 * extracting articles, formatting them, and sending to n8n webhook endpoint.
 * Handles loading and error states during allocation process.
 * 
 * @returns Object containing:
 *   - allocate: Function to allocate articles from a single email
 *   - allocateMultiple: Function to allocate articles from multiple emails
 *   - isAllocating: Boolean indicating if allocation is in progress
 *   - error: Error message if allocation fails
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
      const { formattedEntries } = extractUniqueArticlesFromMultipleEmails(emails)

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

  return {
    allocate,
    allocateMultiple,
    isAllocating,
    error,
  }
}

