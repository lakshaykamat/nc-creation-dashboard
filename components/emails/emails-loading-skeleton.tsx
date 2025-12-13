/**
 * Emails Loading Skeleton Component
 * 
 * Loading state skeleton for emails page
 * 
 * @module components/emails/emails-loading-skeleton
 */

"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface EmailsLoadingSkeletonProps {
  isMobile: boolean
}

export function EmailsLoadingSkeleton({ isMobile }: EmailsLoadingSkeletonProps) {
  return (
    <div className={isMobile ? "h-full" : "grid grid-cols-[30%_1fr] gap-4 h-full overflow-hidden min-h-0"}>
      <div className="border-r overflow-y-auto min-h-0 p-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      {!isMobile && (
        <div className="overflow-hidden h-full min-h-0 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      )}
    </div>
  )
}

