/**
 * Emails Desktop View Component
 * 
 * Desktop-specific split layout for emails page
 * 
 * @module components/emails/emails-desktop-view
 */

"use client"

import { EmailList } from "../list/email-list"
import { EmailViewer } from "../viewer/email-viewer"
import { EmailFilterPanel } from "../email-filter-panel"
import type { Email, EmailFilter, ArticleStats } from "@/types/emails"

interface EmailsDesktopViewProps {
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
  onFilterChange: (value: EmailFilter) => void
  onToggleEmailSelection: (emailId: string) => void
  onAllocate: () => void
}

export function EmailsDesktopView({
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
  onFilterChange,
  onToggleEmailSelection,
  onAllocate,
}: EmailsDesktopViewProps) {
  return (
    <div className="grid grid-cols-[30%_1fr] gap-4 h-full overflow-hidden">
      <div className="border-r overflow-hidden flex flex-col h-full">
        <div className="py-4 border-b shrink-0 px-4">
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
            selectedEmailId={selectedEmail?.id || null}
            selectedEmailIds={selectedEmailIds}
            articleStats={articleStats}
            isDetecting={isDetecting}
            onSelectEmail={onSelectEmail}
            onToggleEmailSelection={onToggleEmailSelection}
          />
        </div>
      </div>
      <div className="overflow-hidden h-full flex flex-col">
        <EmailViewer email={selectedEmail} />
      </div>
    </div>
  )
}

