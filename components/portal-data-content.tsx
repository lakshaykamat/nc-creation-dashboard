"use client"

import { useState } from "react"
import { usePortalData, PortalDataError } from "@/hooks/use-portal-data"
import { PortalDataTable } from "@/components/portal-data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw, ExternalLink } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface PortalDataContentProps {
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  refetch: () => void
  isRefetching: boolean
}

export function PortalDataContent({
  globalFilter,
  onGlobalFilterChange,
  refetch,
  isRefetching,
}: PortalDataContentProps) {
  const { data: response, isLoading, error } = usePortalData()
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  
  // Extract data, message, and html from response
  const data = response?.data || []
  const message = response?.message
  const html = response?.html

  const handleViewPortal = () => {
    if (!html) {
      return
    }
    setIsPortalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="rounded-md border p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (error) {
    const errorObj = error as unknown as Record<string, unknown>
    const errorData: Partial<PortalDataError> = {
      code: typeof errorObj.code === "number" ? errorObj.code : undefined,
      message: typeof errorObj.message === "string" ? errorObj.message : "An error occurred",
      hint: typeof errorObj.hint === "string" ? errorObj.hint : undefined,
    }
    
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 shrink-0 mt-0.5">
            <svg
              className="h-3.5 w-3.5 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-destructive">
              {errorData.code && <span className="mr-2">{errorData.code}</span>}
              Error Loading Data
            </h3>
            {errorData.message && (
              <p className="text-sm text-muted-foreground mt-1.5">{errorData.message}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by Article ID or Done By..."
            value={globalFilter}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            className="flex-1"
            disabled
          />
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleViewPortal}
            disabled={!html}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Portal Here
          </Button>
        </div>
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
              <p className="text-sm text-muted-foreground">
                {message || "No data available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by Article ID or Done By..."
          value={globalFilter}
          onChange={(event) => onGlobalFilterChange(event.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button
          variant="outline"
          onClick={handleViewPortal}
          disabled={!html}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Portal Here
        </Button>
      </div>
      <PortalDataTable
        data={data}
        globalFilter={globalFilter}
      />
      <Sheet 
        open={isPortalOpen} 
        onOpenChange={setIsPortalOpen}
      >
        <SheetContent side="right" className="w-full sm:max-w-4xl p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Portal View</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-5rem)] w-full">
            {html ? (
              <iframe
                srcDoc={html}
                className="w-full h-full border-0"
                title="Portal Content"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No portal content available</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

