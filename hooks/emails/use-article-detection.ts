/**
 * Hook for detecting articles in emails
 * 
 * Handles article detection logic for email list
 * 
 * @module hooks/emails/use-article-detection
 */

import { useEffect, useState, useMemo, useRef } from "react"
import { extractArticleData } from "@/lib/common/article-extractor"
import { getEmailHtmlContent } from "@/lib/emails/email/email-content-utils"
import { extractArticleNumbersFromLastTwoDaysFiles } from "@/lib/emails/articles/article-extraction-utils"
import { createArticleNumberSet } from "@/lib/emails/articles/article-set-utils"
import { createArticleNumbersKey, createEmailIdsKey } from "@/lib/emails/articles/article-key-utils"
import { countAllocatedArticles } from "@/lib/emails/articles/article-counting-utils"
import { getUniqueArticleNumbers } from "@/lib/emails/articles/article-uniqueness-utils"
import { useLastTwoDaysFiles } from "./use-last-two-days-files"
import type { Email, ArticleStats, UseArticleDetectionResult } from "@/types/emails"

/**
 * Calculate article stats for a single email
 */
function calculateEmailArticleStats(
  detectedArticles: string[],
  allocatedArticleSet: Set<string>
): ArticleStats {
  if (detectedArticles.length === 0) {
    return {
      detected: 0,
      allocated: 0,
      unallocated: 0,
    }
  }

  const allocated = countAllocatedArticles(detectedArticles, allocatedArticleSet)
  const detected = detectedArticles.length
  const unallocated = detected - allocated

  return {
    detected,
    allocated,
    unallocated,
  }
}

/**
 * Hook to detect articles in emails and calculate allocated/unallocated
 */
export function useArticleDetection(emails: Email[]): UseArticleDetectionResult {
  const [articleStats, setArticleStats] = useState<Record<string, ArticleStats>>({})
  const [isDetecting, setIsDetecting] = useState(false)

  // Fetch last-two-days-files data in parallel
  const { data: lastTwoDaysFiles = [] } = useLastTwoDaysFiles()

  // Extract and prepare allocated article numbers
  const allocatedArticleNumbersRef = useRef<Set<string>>(new Set())
  
  // Create stable key for allocated articles
  const allocatedArticlesKey = useMemo(() => {
    const numbers = extractArticleNumbersFromLastTwoDaysFiles(lastTwoDaysFiles)
    allocatedArticleNumbersRef.current = createArticleNumberSet(numbers)
    return createArticleNumbersKey(numbers)
  }, [lastTwoDaysFiles])

  // Create stable email IDs key for comparison
  const emailIdsString = useMemo(() => {
    const ids = emails.map((e) => e.id)
    return createEmailIdsKey(ids)
  }, [emails])

  // Store emails in ref to avoid dependency issues
  const emailsRef = useRef<Email[]>(emails)
  useEffect(() => {
    emailsRef.current = emails
  }, [emailIdsString])

  // Process emails and calculate stats
  useEffect(() => {
    if (emailsRef.current.length === 0) {
      setArticleStats({})
      setIsDetecting(false)
      return
    }

    if (lastTwoDaysFiles.length === 0) {
      setArticleStats({})
      setIsDetecting(false)
      return
    }

    let cancelled = false
    setIsDetecting(true)

    const processEmails = async () => {
      const stats: Record<string, ArticleStats> = {}
      const currentEmails = emailsRef.current

      for (const email of currentEmails) {
        if (cancelled) return

        const htmlContent = getEmailHtmlContent(email)
        const result = extractArticleData(htmlContent)

        if (result.hasArticles && result.articleNumbers.length > 0) {
          // Get unique articles (remove duplicates)
          const uniqueArticles = getUniqueArticleNumbers(result.articleNumbers)
          stats[email.id] = calculateEmailArticleStats(
            uniqueArticles,
            allocatedArticleNumbersRef.current
          )
        } else {
          stats[email.id] = {
            detected: 0,
            allocated: 0,
            unallocated: 0,
          }
        }
      }

      if (!cancelled) {
        setArticleStats(stats)
        setIsDetecting(false)
      }
    }

    processEmails()

    return () => {
      cancelled = true
    }
  }, [emailIdsString, allocatedArticlesKey])

  return { articleStats, isDetecting }
}

