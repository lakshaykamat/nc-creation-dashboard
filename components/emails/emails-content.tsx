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
import { useEmailSelection } from "@/hooks/emails/use-email-selection"
import { useEmailAllocation } from "@/hooks/emails/use-email-allocation"
import { EmailsLoadingSkeleton } from "./emails-loading-skeleton"
import { EmailsMobileView } from "./views/emails-mobile-view"
import { EmailsDesktopView } from "./views/emails-desktop-view"
import { ErrorCard } from "@/components/common/error-card"
import { useIsMobile } from "@/hooks/common/use-mobile"
import type { EmailFilter } from "@/types/emails"

interface EmailsContentProps {
  onViewingEmailChange?: (isViewing: boolean) => void
}

export function EmailsContent({ onViewingEmailChange }: EmailsContentProps = {}) {
  const { data: emails = [], isLoading, error, refetch, isRefetching } = useEmails()
  const { articleStats, isDetecting } = useArticleDetection(emails)
  const [emailFilter, setEmailFilter] = useState<EmailFilter>("all")
  const isMobile = useIsMobile()

  const {
    selectedEmail,
    selectedEmailIds,
    setSelectedEmail,
    handleSelectEmail,
    handleBackToList,
    handleToggleEmailSelection,
  } = useEmailSelection()

  const {
    selectedEmailsArticles,
    handleAllocate,
  } = useEmailAllocation(emails, selectedEmailIds)

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
  }, [filteredEmails, isLoading, selectedEmail, isMobile, setSelectedEmail])

  // Notify parent when viewing email changes (mobile only)
  // Must be before any conditional returns to follow Rules of Hooks
  useEffect(() => {
    if (isMobile) {
      onViewingEmailChange?.(!!selectedEmail)
    }
  }, [isMobile, selectedEmail, onViewingEmailChange])

  const hasSelectedEmails = selectedEmailIds.size > 0

  if (isLoading) {
    return <EmailsLoadingSkeleton isMobile={isMobile} />
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

  if (isMobile) {
    return (
      <EmailsMobileView
        selectedEmail={selectedEmail}
        filteredEmails={filteredEmails}
        emailFilter={emailFilter}
        selectedEmailIds={selectedEmailIds}
        articleStats={articleStats}
        isDetecting={isDetecting}
        hasSelectedEmails={hasSelectedEmails}
        totalArticles={selectedEmailsArticles?.totalArticles ?? null}
        previewArticles={selectedEmailsArticles?.previewArticles}
        onSelectEmail={handleSelectEmail}
        onBackToList={handleBackToList}
        onFilterChange={setEmailFilter}
        onToggleEmailSelection={handleToggleEmailSelection}
        onAllocate={handleAllocate}
      />
    )
  }

  return (
    <EmailsDesktopView
      selectedEmail={selectedEmail}
      filteredEmails={filteredEmails}
      emailFilter={emailFilter}
      selectedEmailIds={selectedEmailIds}
      articleStats={articleStats}
      isDetecting={isDetecting}
      hasSelectedEmails={hasSelectedEmails}
      totalArticles={selectedEmailsArticles?.totalArticles ?? null}
      previewArticles={selectedEmailsArticles?.previewArticles}
      onSelectEmail={handleSelectEmail}
      onFilterChange={setEmailFilter}
      onToggleEmailSelection={handleToggleEmailSelection}
      onAllocate={handleAllocate}
    />
  )
}

