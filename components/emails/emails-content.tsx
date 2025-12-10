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
import { EmailFilterPanel } from "./email-filter-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorCard } from "@/components/common/error-card"
import { useIsMobile } from "@/hooks/common/use-mobile"
import { extractUniqueArticlesFromMultipleEmails } from "@/lib/emails/article-allocation-utils"
import { compressToBase64 } from "@/lib/common/compress-utils"
import { useRouter } from "next/navigation"
import type { Email, EmailFilter } from "@/types/emails"

export function EmailsContent() {
  const router = useRouter()
  const { data: emails = [], isLoading, error, refetch, isRefetching } = useEmails()
  const { articleStats, isDetecting } = useArticleDetection(emails)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set())
  const [emailFilter, setEmailFilter] = useState<EmailFilter>("all")
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
  // Only auto-select if current selection is not in the filtered list
  useEffect(() => {
    if (!isLoading && filteredEmails.length > 0 && !isMobile) {
      const isCurrentSelectionValid = selectedEmail && filteredEmails.some(e => e.id === selectedEmail.id)
      if (!isCurrentSelectionValid) {
        setSelectedEmail(filteredEmails[0])
      }
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
    if (selectedEmailsForAllocation.length === 0) return
    
    const { formattedEntries } = extractUniqueArticlesFromMultipleEmails(selectedEmailsForAllocation)
    
    if (formattedEntries.length === 0) return

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

    const { articleNumbers } = extractUniqueArticlesFromMultipleEmails(selectedEmailsForAllocation)
    
    return {
      totalArticles: articleNumbers.length,
      uniqueArticles: articleNumbers,
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
        <div className="p-4 border-b shrink-0">
          <EmailFilterPanel
            emailFilter={emailFilter}
            onFilterChange={setEmailFilter}
            hasSelectedEmails={hasSelectedEmails}
            selectedCount={selectedEmailIds.size}
            totalArticles={selectedEmailsArticles?.totalArticles ?? null}
            onAllocate={handleAllocate}
          />
        </div>
        <div className="flex-1 overflow-y-auto min-w-0">
          <EmailList
            emails={filteredEmails}
            selectedEmailId={null}
            selectedEmailIds={selectedEmailIds}
            articleStats={articleStats}
            isDetecting={isDetecting}
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
        <div className="py-4 border-b shrink-0 px-4">
          <EmailFilterPanel
            emailFilter={emailFilter}
            onFilterChange={setEmailFilter}
            hasSelectedEmails={hasSelectedEmails}
            selectedCount={selectedEmailIds.size}
            totalArticles={selectedEmailsArticles?.totalArticles ?? null}
            onAllocate={handleAllocate}
          />
        </div>
        <div className="flex-1 overflow-y-auto min-w-0">
          <EmailList
            emails={filteredEmails}
            selectedEmailId={selectedEmail?.id || null}
            selectedEmailIds={selectedEmailIds}
            articleStats={articleStats}
            isDetecting={isDetecting}
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

