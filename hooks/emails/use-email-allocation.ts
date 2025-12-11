/**
 * Hook for email allocation logic
 * 
 * @module hooks/emails/use-email-allocation
 */

import { useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { extractUniqueArticlesFromMultipleEmails } from "@/lib/emails/articles/article-extraction-from-multiple-emails-utils"
import { compressToBase64 } from "@/lib/common/compress-utils"
import { extractArticleNumbersFromLastTwoDaysFiles } from "@/lib/emails/articles/article-extraction-utils"
import { createArticleNumberSet } from "@/lib/emails/articles/article-set-utils"
import { useLastTwoDaysFiles } from "./use-last-two-days-files"
import type { Email, ArticleStats } from "@/types/emails"

export function useEmailAllocation(
  emails: Email[],
  selectedEmailIds: Set<string>,
  articleStats: Record<string, ArticleStats>
) {
  const router = useRouter()
  const { data: lastTwoDaysFiles = [] } = useLastTwoDaysFiles()

  // Get allocated article set for filtering
  const allocatedArticleSet = useMemo(() => {
    const allocatedNumbers = extractArticleNumbersFromLastTwoDaysFiles(lastTwoDaysFiles)
    return createArticleNumberSet(allocatedNumbers)
  }, [lastTwoDaysFiles])

  const selectedEmailsForAllocation = useMemo(() => {
    return emails.filter((email) => selectedEmailIds.has(email.id))
  }, [emails, selectedEmailIds])

  const selectedEmailsArticles = useMemo(() => {
    if (selectedEmailsForAllocation.length === 0) return null

    const { articleNumbers, pageMap } = extractUniqueArticlesFromMultipleEmails(selectedEmailsForAllocation)
    
    // Filter out already allocated articles
    const unallocatedArticles = articleNumbers.filter(
      (articleId) => !allocatedArticleSet.has(articleId.toUpperCase())
    )
    
    // Format articles for preview table (only unallocated)
    const previewArticles = unallocatedArticles.map((articleId) => ({
      articleId,
      pages: pageMap[articleId] || 0,
    }))
    
    return {
      totalArticles: unallocatedArticles.length,
      uniqueArticles: unallocatedArticles,
      previewArticles,
    }
  }, [selectedEmailsForAllocation, allocatedArticleSet])

  const handleAllocate = useCallback(() => {
    if (selectedEmailsForAllocation.length === 0) return
    
    const { articleNumbers, pageMap } = extractUniqueArticlesFromMultipleEmails(selectedEmailsForAllocation)
    
    // Filter out already allocated articles
    const unallocatedArticles = articleNumbers.filter(
      (articleId) => !allocatedArticleSet.has(articleId.toUpperCase())
    )
    
    if (unallocatedArticles.length === 0) return

    // Format entries for allocation (only unallocated articles)
    const formattedEntries = unallocatedArticles.map((articleId) => {
      const pages = pageMap[articleId] || 0
      return `${articleId} [${pages}]`
    })

    // Compress and navigate to file allocator form
    const jsonString = JSON.stringify(formattedEntries)
    const compressedData = compressToBase64(jsonString)
    router.push(`/file-allocator/form?data=${encodeURIComponent(compressedData)}`)
  }, [selectedEmailsForAllocation, allocatedArticleSet, router])

  return {
    selectedEmailsForAllocation,
    selectedEmailsArticles,
    handleAllocate,
  }
}

