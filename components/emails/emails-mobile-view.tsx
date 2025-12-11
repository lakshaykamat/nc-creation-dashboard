/**
 * Emails Mobile View Component
 * 
 * Mobile-specific layout for emails page
 * 
 * @module components/emails/emails-mobile-view
 */

"use client"

import { EmailList } from "./email-list"
import { EmailViewer } from "./email-viewer"
import { EmailFilterPanel } from "./email-filter-panel"
import type { Email, EmailFilter, ArticleStats } from "@/types/emails"

interface EmailsMobileViewProps {
  selectedEmail: Email | null
  filteredEmails: Email[]
  emailFilter: EmailFilter
  selectedEmailIds: Set<string>
  articleStats: Record<string, ArticleStats>
  isDetecting: boolean
  hasSelectedEmails: boolean
  totalArticles: number | null
  previewArticles?: Array<{ articleId: string; pages: number }>
  onSelectEmail: (email: Email) => void
  onBackToList: () => void
  onFilterChange: (value: EmailFilter) => void
  onToggleEmailSelection: (emailId: string) => void
  onAllocate: () => void
}

export function EmailsMobileView({
  selectedEmail,
  filteredEmails,
  emailFilter,
  selectedEmailIds,
  articleStats,
  isDetecting,
  hasSelectedEmails,
  totalArticles,
  previewArticles,
  onSelectEmail,
  onBackToList,
  onFilterChange,
  onToggleEmailSelection,
  onAllocate,
}: EmailsMobileViewProps) {
  if (selectedEmail) {
    return (
      <div className="h-full w-full flex flex-col min-h-0 overflow-hidden">
        <EmailViewer email={selectedEmail} onBack={onBackToList} />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b shrink-0">
        <EmailFilterPanel
          emailFilter={emailFilter}
          onFilterChange={onFilterChange}
          hasSelectedEmails={hasSelectedEmails}
          selectedCount={selectedEmailIds.size}
          totalArticles={totalArticles}
          previewArticles={previewArticles}
          onAllocate={onAllocate}
        />
      </div>
      <div className="flex-1 overflow-y-auto min-w-0">
        <EmailList
          emails={filteredEmails}
          selectedEmailId={null}
          selectedEmailIds={selectedEmailIds}
          articleStats={articleStats}
          isDetecting={isDetecting}
          onSelectEmail={onSelectEmail}
          onToggleEmailSelection={onToggleEmailSelection}
        />
      </div>
    </div>
  )
}

