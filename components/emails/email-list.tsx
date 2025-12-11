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
import { getEmailPreview, formatEmailDateRelative } from "@/lib/emails/email-utils"
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
              "w-full py-4 px-4 hover:bg-muted/50 transition-colors rounded-md cursor-pointer",
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
                className="flex-1 text-left space-y-2 min-w-0"
              >
                <div className="space-y-2 min-w-0">
                  {isDetecting ? (
                    <div className="flex items-center justify-end">
                      <Badge variant="outline" className="shrink-0 animate-pulse">
                        Detecting...
                      </Badge>
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold line-clamp-2 wrap-break-word flex-1 min-w-0">
                      {email.subject}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                      {formatEmailDateRelative(email.date)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 wrap-break-word">
                    {getEmailPreview(email)}
                  </div>
                  {hasArticles && !isDetecting ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 dark:bg-green-500/20 border border-green-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-500" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">
                          Allocated {stats.allocated}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 dark:bg-red-500/20 border border-red-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-500" />
                        <span className="text-xs font-medium text-red-700 dark:text-red-400">
                          Unallocated {stats.unallocated}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

