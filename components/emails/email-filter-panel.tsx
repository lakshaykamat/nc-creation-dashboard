/**
 * Email Filter and Allocation Panel Component
 * 
 * Shared component for filter dropdown and allocation controls
 * 
 * @module components/emails/email-filter-panel
 */

"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { EmailFilterPanelProps, EmailFilter } from "@/types/emails"

export function EmailFilterPanel({
  emailFilter,
  onFilterChange,
  hasSelectedEmails,
  selectedCount,
  totalArticles,
  onAllocate,
  isAllocating = false,
}: EmailFilterPanelProps) {
  return (
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
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">
              Selected: {selectedCount}
            </div>
            {totalArticles !== null && (
              <div className="text-sm text-muted-foreground">
                Articles: {totalArticles}
              </div>
            )}
          </div>
          <Button
            onClick={onAllocate}
            disabled={selectedCount === 0 || isAllocating}
            size="sm"
            className="w-full"
          >
            {isAllocating ? "Allocating..." : "Allocate Articles"}
          </Button>
        </div>
      )}
    </div>
  )
}

