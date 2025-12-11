/**
 * Hook for email allocation logic
 * 
 * @module hooks/emails/use-email-allocation
 */

import { useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { extractUniqueArticlesFromMultipleEmails } from "@/lib/emails/article-allocation-utils"
import { compressToBase64 } from "@/lib/common/compress-utils"
import type { Email } from "@/types/emails"

export function useEmailAllocation(emails: Email[], selectedEmailIds: Set<string>) {
  const router = useRouter()

  const selectedEmailsForAllocation = useMemo(() => {
    return emails.filter((email) => selectedEmailIds.has(email.id))
  }, [emails, selectedEmailIds])

  const selectedEmailsArticles = useMemo(() => {
    if (selectedEmailsForAllocation.length === 0) return null

    const { articleNumbers, pageMap } = extractUniqueArticlesFromMultipleEmails(selectedEmailsForAllocation)
    
    // Format articles for preview table
    const previewArticles = articleNumbers.map((articleId) => ({
      articleId,
      pages: pageMap[articleId] || 0,
    }))
    
    return {
      totalArticles: articleNumbers.length,
      uniqueArticles: articleNumbers,
      previewArticles,
    }
  }, [selectedEmailsForAllocation])

  const handleAllocate = useCallback(() => {
    if (selectedEmailsForAllocation.length === 0) return
    
    const { formattedEntries } = extractUniqueArticlesFromMultipleEmails(selectedEmailsForAllocation)
    
    if (formattedEntries.length === 0) return

    // Compress and navigate to file allocator form
    const jsonString = JSON.stringify(formattedEntries)
    const compressedData = compressToBase64(jsonString)
    router.push(`/file-allocator/form?data=${encodeURIComponent(compressedData)}`)
  }, [selectedEmailsForAllocation, router])

  return {
    selectedEmailsForAllocation,
    selectedEmailsArticles,
    handleAllocate,
  }
}

