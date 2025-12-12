/**
 * Email Filter and Allocation Panel Component
 * 
 * Shared component for filter dropdown and allocation controls
 * 
 * @module components/emails/email-filter-panel
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmailArticlesPreviewDialog } from "./dialogs/email-articles-preview-dialog"
import type { EmailFilterPanelProps, EmailFilter } from "@/types/emails"

export function EmailFilterPanel({
  emailFilter,
  onFilterChange,
  hasSelectedEmails,
  selectedCount,
  totalArticles,
  onAllocate,
  isAllocating = false,
  previewArticles,
}: EmailFilterPanelProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const allocateDisabled = selectedCount === 0 || isAllocating || (totalArticles !== null && totalArticles === 0)

  return (
    <>
      <div className="space-y-3">
        <Select value={emailFilter} onValueChange={(value) => onFilterChange(value as EmailFilter)}>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Filter emails" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Emails</SelectItem>
            <SelectItem value="unallocated">Unallocated Articles</SelectItem>
          </SelectContent>
        </Select>
        {hasSelectedEmails && (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsPreviewOpen(true)}
              disabled={selectedCount === 0}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Preview Articles
            </Button>
            <Button
              onClick={onAllocate}
              disabled={allocateDisabled}
              size="sm"
              className="flex-1"
            >
              {isAllocating ? "Allocating..." : "Allocate Articles"}{totalArticles ? ` (${totalArticles})` : ""}
            </Button>
          </div>
        )}
      </div>
      <EmailArticlesPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        articles={previewArticles || []}
      />
    </>
  )
}

