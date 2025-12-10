/**
 * Email List Component
 * 
 * Displays list of emails in the left panel
 * 
 * @module components/emails/email-list
 */

"use client"

import { cn } from "@/lib/common/utils"
import type { Email } from "@/types/emails"

interface EmailListProps {
  emails: Email[]
  selectedEmailId: string | null
  onSelectEmail: (email: Email) => void
}

export function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
}: EmailListProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch {
      return dateString
    }
  }

  const getFromName = (email: Email) => {
    return email.from.value[0]?.name || email.from.value[0]?.address || "Unknown"
  }

  if (emails.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No emails found
      </div>
    )
  }

  return (
    <div className="divide-y">
      {emails.map((email) => (
        <button
          key={email.id}
          onClick={() => onSelectEmail(email)}
          className={cn(
            "w-full py-4 px-4 text-left hover:bg-muted/50 transition-colors cursor-pointer rounded-md",
            selectedEmailId === email.id && "bg-muted"
          )}
        >
          <div className="space-y-1">
            <div className="font-medium text-sm line-clamp-1">
              {getFromName(email)}
            </div>
            <div className="text-sm font-semibold line-clamp-1">
              {email.subject}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {email.text || email.textAsHtml || "No preview available"}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {formatDate(email.date)}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

