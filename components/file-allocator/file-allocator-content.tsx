"use client"

import { useState } from "react"
import { useFileAllocator } from "@/hooks/file-allocator/use-file-allocator"
import { FileAllocatorLoading } from "./file-allocator-loading"
import { AllocationArticlesTable } from "./allocation-articles-table"
import { AllocationEmailViewer } from "./allocation-email-viewer"
import { AllocationActions } from "./allocation-actions"
import { ErrorCard } from "@/components/common/error-card"

export function FileAllocatorContent() {
  const [emailIndex, setEmailIndex] = useState<number | null>(null)
  const isLatest = emailIndex === null
  
  const { data, isLoading, error, refetch, isRefetching } = useFileAllocator(
    isLatest,
    emailIndex ?? undefined
  )
  
  // Toggle to show/hide "Coming Soon" card
  const showComingSoon = false

  const handlePreviousEmail = () => {
    if (isLatest) {
      setEmailIndex(1)
    } else {
      setEmailIndex((prev) => (prev ?? 0) + 1)
    }
  }

  const handleNextEmail = () => {
    if (emailIndex === null) return
    if (emailIndex === 1) {
      setEmailIndex(null) // Go back to latest
    } else {
      setEmailIndex((prev) => Math.max(1, (prev ?? 1) - 1))
    }
  }

  const getEmailPosition = (): string => {
    if (isLatest) {
      return "Latest"
    }
    return `#${emailIndex! + 1}`
  }

  if (isLoading) {
    return <FileAllocatorLoading />
  }

  if (error) {
    return (
      <ErrorCard
        error={error}
        onRetry={() => refetch()}
        retryLabel={isRefetching ? "Retrying..." : "Try Again"}
      />
    )
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-muted bg-muted/50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted shrink-0">
            <svg
              className="h-3.5 w-3.5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 relative">
      {showComingSoon && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background shadow-2xl backdrop-blur-sm pointer-events-auto w-full max-w-2xl mx-4 p-8 rounded-lg">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-primary tracking-wide">Send a kiss if you want access</h3>
                <p className="text-base text-muted-foreground max-w-md mx-auto">
                  This feature is currently under development and will be available soon. Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-10 gap-4 ${showComingSoon ? "opacity-30 pointer-events-none" : ""}`}>
        <AllocationArticlesTable
          articles={data.newArticlesWithPages || []}
          totalNewArticles={data.totalNewArticles}
        />

        <AllocationEmailViewer
          html={data.html || ""}
          emailDate={data.emailDate}
          emailPosition={getEmailPosition()}
          onPrevious={handlePreviousEmail}
          onNext={handleNextEmail}
          isLatest={isLatest}
          isRefetching={isRefetching}
          isLoading={isLoading}
        />
      </div>

      <AllocationActions
        articles={data.newArticlesWithPages || []}
        showComingSoon={showComingSoon}
      />
    </div>
  )
}

