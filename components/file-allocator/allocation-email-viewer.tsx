/**
 * Allocation Email Viewer Component
 * 
 * Displays email HTML content for allocation
 * 
 * @module components/file-allocator/allocation-email-viewer
 */

"use client"

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AllocationEmailViewerProps {
  html: string
  emailDate: string
  emailPosition: string
  onPrevious: () => void
  onNext: () => void
  isLatest: boolean
  isRefetching: boolean
  isLoading: boolean
}

export function AllocationEmailViewer({
  html,
  emailDate,
  emailPosition,
  onPrevious,
  onNext,
  isLatest,
  isRefetching,
  isLoading,
}: AllocationEmailViewerProps) {
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "-"
    try {
      const date = new Date(dateStr)
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Card className="flex flex-col min-h-[400px] max-h-[600px] lg:col-span-7">
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Email</CardTitle>
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              {emailPosition}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDate(emailDate)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden mb-4">
          {html ? (
            <div className="border rounded-lg overflow-hidden bg-muted/30 h-full">
              <iframe
                srcDoc={html}
                className="w-full h-full border-0"
                title="Allocation Details HTML"
                sandbox="allow-same-origin"
              />
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-center outline gap-2 pt-4 border-t shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={isRefetching || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={isRefetching || isLoading || isLatest}
          >
            Next Email
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

