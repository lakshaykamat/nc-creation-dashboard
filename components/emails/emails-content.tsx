/**
 * Emails Content Component
 * 
 * Main content component for emails page with split view
 * 
 * @module components/emails/emails-content
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { useEmails } from "@/hooks/emails/use-emails"
import { useArticleDetection } from "@/hooks/emails/use-article-detection"
import { EmailList } from "./email-list"
import { EmailViewer } from "./email-viewer"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorCard } from "@/components/common/error-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useIsMobile } from "@/hooks/common/use-mobile"
import { extractUniqueArticlesFromEmail } from "@/lib/emails/article-allocation-utils"
import { compressToBase64 } from "@/lib/common/compress-utils"
import { useRouter } from "next/navigation"
import type { Email } from "@/types/emails"

export function EmailsContent() {
  const router = useRouter()
  const { data: emails = [], isLoading, error, refetch, isRefetching } = useEmails()
  const { articleStats } = useArticleDetection(emails)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set())
  const [emailFilter, setEmailFilter] = useState<"all" | "unallocated">("all")
  const isMobile = useIsMobile()

  // Filter emails with unallocated articles
  const filteredEmails = useMemo(() => {
    if (emailFilter === "all") return emails
    
    return emails.filter((email) => {
      const stats = articleStats[email.id]
      return stats && stats.unallocated > 0
    })
  }, [emails, emailFilter, articleStats])

  // Auto-select first email when filtered emails change (desktop only)
  useEffect(() => {
    if (!isLoading && filteredEmails.length > 0 && !selectedEmail && !isMobile) {
      setSelectedEmail(filteredEmails[0])
    }
  }, [filteredEmails, isLoading, selectedEmail, isMobile])

  const handleToggleEmailSelection = (emailId: string) => {
    setSelectedEmailIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(emailId)) {
        newSet.delete(emailId)
      } else {
        newSet.add(emailId)
      }
      return newSet
    })
  }

  const handleAllocate = () => {
    const selectedEmails = emails.filter((email) => selectedEmailIds.has(email.id))
    
    if (selectedEmails.length === 0) return
    
    // Collect all unique articles from selected emails
    const allArticles = new Set<string>()
    const articlePageMap: Record<string, number> = {}

    selectedEmails.forEach((email) => {
      const { articleNumbers, pageMap } = extractUniqueArticlesFromEmail(email)
      
      articleNumbers.forEach((article) => {
        if (!allArticles.has(article)) {
          allArticles.add(article)
          articlePageMap[article] = pageMap[article] || 0
        }
      })
    })

    if (allArticles.size === 0) return

    // Build formatted entries
    const formattedEntries = Array.from(allArticles).map((article) => {
      const pages = articlePageMap[article] || 0
      return `${article} [${pages}]`
    })

    // Compress and navigate to file allocator form
    const jsonString = JSON.stringify(formattedEntries)
    const compressedData = compressToBase64(jsonString)
    router.push(`/file-allocator/form?data=${encodeURIComponent(compressedData)}`)
  }

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email)
  }

  const handleBackToList = () => {
    setSelectedEmail(null)
  }

  // Get selected emails for allocation
  const selectedEmailsForAllocation = useMemo(() => {
    return emails.filter((email) => selectedEmailIds.has(email.id))
  }, [emails, selectedEmailIds])

  // Calculate total unique articles from selected emails
  const selectedEmailsArticles = useMemo(() => {
    if (selectedEmailsForAllocation.length === 0) return null

    const allArticles = new Set<string>()
    let totalArticles = 0

    selectedEmailsForAllocation.forEach((email) => {
      const { articleNumbers } = extractUniqueArticlesFromEmail(email)
      articleNumbers.forEach((article) => {
        if (!allArticles.has(article)) {
          allArticles.add(article)
          totalArticles++
        }
      })
    })

    return {
      totalArticles,
      uniqueArticles: Array.from(allArticles),
    }
  }, [selectedEmailsForAllocation])

  const hasSelectedEmails = selectedEmailIds.size > 0

  if (isLoading) {
    return (
      <div className={isMobile ? "h-full" : "grid grid-cols-[30%_1fr] gap-4 h-full overflow-hidden min-h-0"}>
        <div className="border-r overflow-y-auto min-h-0 p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2 p-4 border rounded-md">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
        {!isMobile && (
          <div className="overflow-hidden h-full min-h-0 p-4 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-96 w-full" />
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <ErrorCard
        error={error instanceof Error ? error : new Error("Failed to load emails")}
        onRetry={() => refetch()}
        retryLabel={isRefetching ? "Retrying..." : "Try Again"}
      />
    )
  }

  // Mobile view: show list or viewer based on selection
  if (isMobile) {
    if (selectedEmail) {
      return (
        <div className="h-full">
          <EmailViewer email={selectedEmail} onBack={handleBackToList} />
        </div>
      )
    }
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="p-4 border-b shrink-0 space-y-3">
          <Select value={emailFilter} onValueChange={(value) => setEmailFilter(value as "all" | "unallocated")}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Filter emails" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Emails</SelectItem>
              <SelectItem value="unallocated">Unallocated Articles</SelectItem>
            </SelectContent>
          </Select>
          {hasSelectedEmails && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">
                  Selected: {selectedEmailIds.size}
                </div>
                {selectedEmailsArticles && (
                  <div className="text-sm text-muted-foreground">
                    Articles: {selectedEmailsArticles.totalArticles}
                  </div>
                )}
              </div>
              <Button
                onClick={handleAllocate}
                disabled={selectedEmailIds.size === 0}
                size="sm"
                className="w-full"
              >
                Allocate Articles
              </Button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto min-w-0">
          <EmailList
            emails={filteredEmails}
            selectedEmailId={null}
            selectedEmailIds={selectedEmailIds}
            onSelectEmail={handleSelectEmail}
            onToggleEmailSelection={handleToggleEmailSelection}
          />
        </div>
      </div>
    )
  }

  // Desktop view: split layout
  return (
    <div className="grid grid-cols-[30%_1fr] gap-4 h-full overflow-hidden min-h-0">
      <div className="border-r overflow-hidden min-h-0 flex flex-col">
        <div className="py-4 border-b shrink-0 space-y-3">
          <Select value={emailFilter} onValueChange={(value) => setEmailFilter(value as "all" | "unallocated")}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Filter emails" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Emails</SelectItem>
              <SelectItem value="unallocated">Unallocated Articles</SelectItem>
            </SelectContent>
          </Select>
          {hasSelectedEmails && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">
                  Selected: {selectedEmailIds.size}
                </div>
                {selectedEmailsArticles && (
                  <div className="text-sm text-muted-foreground">
                    Articles: {selectedEmailsArticles.totalArticles}
                  </div>
                )}
              </div>
              <Button
                onClick={handleAllocate}
                disabled={selectedEmailIds.size === 0}
                size="sm"
                className="w-full"
              >
                Allocate Articles
              </Button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto min-w-0">
          <EmailList
            emails={filteredEmails}
            selectedEmailId={selectedEmail?.id || null}
            selectedEmailIds={selectedEmailIds}
            onSelectEmail={handleSelectEmail}
            onToggleEmailSelection={handleToggleEmailSelection}
          />
        </div>
      </div>
      <div className="overflow-hidden h-full min-h-0 flex flex-col">
        <div className="flex-1 overflow-hidden min-h-0">
          <EmailViewer email={selectedEmail} />
        </div>
      </div>
    </div>
  )
}

