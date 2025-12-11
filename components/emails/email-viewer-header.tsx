/**
 * Email Viewer Header Component
 * 
 * Header section of email viewer with back button, subject, and metadata
 * 
 * @module components/emails/email-viewer-header
 */

"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatEmailDateRelative } from "@/lib/emails/email/email-date-formatting-utils"
import { getEmailSenderName, getEmailSenderAddress } from "@/lib/emails/email/email-sender-utils"
import { getEmailRecipients } from "@/lib/emails/email/email-recipient-utils"
import type { Email } from "@/types/emails"

interface EmailViewerHeaderProps {
  email: Email
  onBack?: () => void
  isMobile: boolean
}

export function EmailViewerHeader({ email, onBack, isMobile }: EmailViewerHeaderProps) {
  const fromName = getEmailSenderName(email)
  const fromAddress = getEmailSenderAddress(email)
  const toAddresses = getEmailRecipients(email)

  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (onBack) {
      onBack()
    }
  }

  const headerClasses = isMobile && onBack
    ? "border-b pb-2 px-3 pt-2 shrink-0 relative z-10 bg-background"
    : "border-b pb-4 shrink-0 relative z-10 bg-background"

  const subjectClasses = isMobile && onBack
    ? "font-semibold text-sm line-clamp-2"
    : "font-semibold text-lg"

  const metadataClasses = isMobile && onBack
    ? "text-xs text-muted-foreground line-clamp-1"
    : "text-sm text-muted-foreground"

  return (
    <div className={headerClasses}>
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className={isMobile ? "mb-1.5 -ml-2 relative z-10 pointer-events-auto" : "mb-3 -ml-2 relative z-10 pointer-events-auto"}
          type="button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}
      <div className={isMobile && onBack ? "space-y-1" : "space-y-2"}>
        <div className={subjectClasses}>{email.subject}</div>
        <div className={metadataClasses}>
          <span className="font-medium">{fromName}</span>
          {fromAddress && fromName !== fromAddress && (
            <span className="text-muted-foreground/70"> &lt;{fromAddress}&gt;</span>
          )}
          {toAddresses && (
            <>
              <span className={isMobile && onBack ? "mx-1" : "mx-2"}>→</span>
              <span className={isMobile && onBack ? "truncate" : ""}>{toAddresses}</span>
            </>
          )}
          <span className={isMobile && onBack ? "ml-1" : "ml-2"}>• {formatEmailDateRelative(email.date)}</span>
        </div>
      </div>
    </div>
  )
}

