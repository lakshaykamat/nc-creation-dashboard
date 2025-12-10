/**
 * Emails Content Component
 * 
 * Main content component for emails page with split view
 * 
 * @module components/emails/emails-content
 */

"use client"

import { useState } from "react"
import { useEmails } from "@/hooks/emails/use-emails"
import { EmailList } from "./email-list"
import { EmailViewer } from "./email-viewer"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorCard } from "@/components/common/error-card"
import { useIsMobile } from "@/hooks/common/use-mobile"
import type { Email } from "@/types/emails"

export function EmailsContent() {
  const { data: emails = [], isLoading, error, refetch, isRefetching } = useEmails()
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const isMobile = useIsMobile()

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email)
  }

  const handleBackToList = () => {
    setSelectedEmail(null)
  }

  if (isLoading) {
    return (
      <div className={isMobile ? "h-full" : "grid grid-cols-[30%_1fr] gap-4 h-full"}>
        <Skeleton className="h-full" />
        {!isMobile && <Skeleton className="h-full" />}
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
      <div className="h-full">
        <EmailList
          emails={emails}
          selectedEmailId={null}
          onSelectEmail={handleSelectEmail}
        />
      </div>
    )
  }

  // Desktop view: split layout
  return (
    <div className="grid grid-cols-[30%_1fr] gap-4 h-full overflow-hidden min-h-0">
      <div className="border-r overflow-y-auto min-h-0">
        <EmailList
          emails={emails}
          selectedEmailId={selectedEmail?.id || null}
          onSelectEmail={handleSelectEmail}
        />
      </div>
      <div className="overflow-hidden h-full min-h-0 flex flex-col">
        <EmailViewer email={selectedEmail} />
      </div>
    </div>
  )
}

