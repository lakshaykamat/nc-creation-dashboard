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
          <div key={i} className="space-y-2 p-4 border rounded-md">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      {!isMobile && (
        <div className="overflow-hidden h-full min-h-0 p-4 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}
    </div>
  )
}

