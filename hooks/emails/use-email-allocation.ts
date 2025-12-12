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
import { useRecentlyAllocatedArticles } from "./use-last-two-days-files"
import type { Email } from "@/types/emails"

/**
 * Manages article allocation from selected emails
 * 
 * Extracts unique articles from selected emails, filters out already allocated articles
 * by comparing against last two days files data, and provides navigation to the
 * file allocator form with compressed article data.
 * 
 * @param emails - All available emails
 * @param selectedEmailIds - Set of selected email IDs to process
 * @returns Object containing:
 *   - selectedEmailsForAllocation: Filtered emails that are selected
 *   - selectedEmailsArticles: Unallocated articles with counts and preview data
 *   - handleAllocate: Function to navigate to allocation form with article data
 */
export function useEmailAllocation(
  emails: Email[],
  selectedEmailIds: Set<string>
) {
  const router = useRouter()
  const { data: lastTwoDaysFiles = [] } = useRecentlyAllocatedArticles()

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
    if (!selectedEmailsArticles || selectedEmailsArticles.totalArticles === 0) return

    // Reuse previewArticles which already has unallocated articles with pages
    const formattedEntries = selectedEmailsArticles.previewArticles.map(
      (article) => `${article.articleId} [${article.pages}]`
    )

    // Compress and navigate to file allocator form
    const jsonString = JSON.stringify(formattedEntries)
    const compressedData = compressToBase64(jsonString)
    router.push(`/file-allocator/form?data=${encodeURIComponent(compressedData)}`)
  }, [selectedEmailsArticles, router])

  return {
    selectedEmailsForAllocation,
    selectedEmailsArticles,
    handleAllocate,
  }
}

