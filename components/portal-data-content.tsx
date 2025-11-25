"use client"

import { useState, useRef, useEffect } from "react"
import { useFilteredPortalData, PortalDataError, PortalData } from "@/hooks/use-portal-data"
import { PortalDataTable } from "@/components/portal-data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw, ExternalLink, Copy } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface PortalDataContentProps {
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
}

export function PortalDataContent({
  globalFilter,
  onGlobalFilterChange,
}: PortalDataContentProps) {
  const {
    data: filteredData,
    allData: data,
    message,
    html,
    isLoading,
    error,
    showTexRows,
    setShowTexRows,
    refetch: refetchFromHook,
    isRefetching: isRefetchingFromHook,
  } = useFilteredPortalData()
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleViewPortal = () => {
    if (!html) {
      return
    }
    setIsPortalLoading(true)
    setIsPortalOpen(true)
  }

  const handleCopyAllRows = async () => {
    if (filteredData.length === 0) return
    
    // Sort by doneBy (name), then by articleId
    const sortedRows = [...filteredData].sort((a, b) => {
      const nameA = (a.doneBy || "").toLowerCase()
      const nameB = (b.doneBy || "").toLowerCase()
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB)
      }
      return a.articleId.localeCompare(b.articleId)
    })
    
    // Format: ARTICLE ID NAME (one per line)
    const textToCopy = sortedRows
      .map((row) => `${row.articleId} ${row.doneBy || ""}`.trim())
      .join("\n")
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  useEffect(() => {
    if (isPortalOpen && html) {
      // For srcDoc, content is set immediately, so use a short delay to show loading
      // then clear it to reveal the iframe content
      const timeout = setTimeout(() => {
        setIsPortalLoading(false)
      }, 300)
      
      return () => {
        clearTimeout(timeout)
      }
    } else if (!isPortalOpen) {
      setIsPortalLoading(false)
    }
  }, [isPortalOpen, html])

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
            onClick={() => refetchFromHook()}
            disabled={isRefetchingFromHook}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetchingFromHook ? "animate-spin" : ""}`} />
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
          <Button
            variant="outline"
            onClick={() => setShowTexRows(!showTexRows)}
            disabled={!data || data.length === 0}
          >
            {showTexRows ? "Hide" : "Show"} TEX
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-1 py-2 border-b rounded-t-md bg-muted/30">
        <Input
          placeholder="Search across all columns..."
          value={globalFilter}
          onChange={(event) => onGlobalFilterChange(event.target.value)}
          className="flex-1 max-w-md"
        />
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => refetchFromHook()}
            disabled={isRefetchingFromHook}
            className="w-full sm:w-auto"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${isRefetchingFromHook ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyAllRows}
            disabled={filteredData.length === 0}
            title="Copy article IDs and names (sorted by name)"
            className="w-full sm:w-auto"
            size="sm"
          >
            <Copy className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            <span className="sm:hidden">{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleViewPortal}
            disabled={!html}
            className="w-full sm:w-auto"
            size="sm"
            title="Open portal in sidebar"
          >
            <ExternalLink className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Open Portal</span>
            <span className="sm:hidden">Portal</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowTexRows(!showTexRows)}
            className="w-full sm:w-auto col-span-2 sm:col-span-1"
            size="sm"
            title={showTexRows ? "Hide TEX source files" : "Show TEX source files"}
          >
            <span className="hidden sm:inline">{showTexRows ? "Hide" : "Show"} TEX</span>
            <span className="sm:hidden">{showTexRows ? "Hide" : "Show"} TEX</span>
          </Button>
        </div>
      </div>
      <PortalDataTable
        data={filteredData}
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
          <div className="h-[calc(100vh-5rem)] w-full relative">
            {isPortalLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading Portal...</p>
                </div>
              </div>
            )}
            {html ? (
              <iframe
                ref={iframeRef}
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

