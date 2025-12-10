/**
 * Email List Component
 * 
 * Displays list of emails in the left panel
 * 
 * @module components/emails/email-list
 */

"use client"

import { cn } from "@/lib/common/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { formatEmailDate, getEmailSenderName, getEmailPreview } from "@/lib/emails/email-utils"
import type { EmailListProps } from "@/types/emails"

export function EmailList({
  emails,
  selectedEmailId,
  selectedEmailIds,
  articleStats,
  isDetecting,
  onSelectEmail,
  onToggleEmailSelection,
}: EmailListProps) {

  if (emails.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No emails found
      </div>
    )
  }

  return (
    <div className="divide-y">
      {emails.map((email) => {
        const stats = articleStats[email.id] || { detected: 0, allocated: 0, unallocated: 0 }
        const hasArticles = stats.detected > 0
        const isChecked = selectedEmailIds.has(email.id)

        return (
          <div
            key={email.id}
            className={cn(
              "w-full py-4 px-4 hover:bg-muted/50 transition-colors rounded-md",
              selectedEmailId === email.id && "bg-muted"
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => onToggleEmailSelection(email.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 shrink-0"
              />
              <button
                onClick={() => onSelectEmail(email)}
                className="flex-1 text-left space-y-1 min-w-0"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="font-medium text-sm line-clamp-1 flex-1 min-w-0 wrap-break-word">
                      {getEmailSenderName(email)}
                    </div>
                    {isDetecting ? (
                      <Badge variant="outline" className="shrink-0 animate-pulse">
                        Detecting...
                      </Badge>
                    ) : hasArticles ? (
                      <div className="shrink-0 flex items-center gap-1 text-xs font-medium whitespace-nowrap">
                        <span className="text-green-600 dark:text-green-500">
                          A {stats.allocated}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-red-600 dark:text-red-500">
                          U {stats.unallocated}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="text-sm font-semibold line-clamp-2 wrap-break-word">
                    {email.subject}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 wrap-break-word">
                    {getEmailPreview(email)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 whitespace-nowrap">
                    {formatEmailDate(email.date)}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

