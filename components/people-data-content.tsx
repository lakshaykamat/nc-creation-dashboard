"use client"

import { useState, useRef, useEffect } from "react"
import { useFilteredLastTwoDaysFilesData, LastTwoDaysFileData } from "@/hooks/use-last-two-days-files-data"
import { PeopleDataTable } from "@/components/people-data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw, Copy, Calendar, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PeopleChart } from "@/components/people-chart"
import { ErrorCard } from "@/components/error-card"

interface PeopleDataContentProps {
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
}

interface PersonCardProps {
  personName: string
  items: LastTwoDaysFileData[]
}

function PersonCard({ personName, items }: PersonCardProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollLabel, setShowScrollLabel] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const checkScrollable = () => {
      if (contentRef.current && containerRef.current) {
        const { scrollHeight } = contentRef.current
        const { clientHeight, scrollTop } = containerRef.current
        // Show label only if content is scrollable AND user is at the top
        setShowScrollLabel(scrollHeight > clientHeight && scrollTop < 10)
      }
    }

    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop } = containerRef.current
        // Hide label when user scrolls down
        if (scrollTop > 10) {
          setShowScrollLabel(false)
        } else {
          checkScrollable()
        }
      }
    }

    checkScrollable()
    // Check again after a short delay to ensure content is rendered
    const timeout = setTimeout(checkScrollable, 100)
    
    // Add scroll listener
    container.addEventListener("scroll", handleScroll)
    // Also check on window resize
    window.addEventListener("resize", checkScrollable)
    
    return () => {
      clearTimeout(timeout)
      container.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", checkScrollable)
    }
  }, [items])

  const handleCopyPersonArticles = async () => {
    const articleNumbers = items
      .map((item) => item["Article number"])
      .join("\n")
    
    try {
      await navigator.clipboard.writeText(articleNumbers)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card className="min-w-[280px] flex-shrink-0 flex flex-col h-[400px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">
            {personName} ({items.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyPersonArticles}
            className="h-6 w-6 shrink-0"
            title="Copy article numbers"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent ref={containerRef} className="flex-1 overflow-y-auto min-h-0 relative">
        <div ref={contentRef} className="space-y-2 pr-2">
          {items.map((item, index) => {
            const completed = item.Completed || ""
            const completedLower = completed.toLowerCase()
            let bgColor = "bg-gray-100 text-gray-700"
            if (completedLower === "completed" || completedLower.includes("done")) {
              bgColor = "bg-green-100 text-green-700"
            } else if (completedLower === "not started" || completedLower.includes("not")) {
              bgColor = "bg-red-100 text-red-700"
            } else if (completedLower.includes("in progress") || completedLower.includes("progress")) {
              bgColor = "bg-yellow-100 text-yellow-700"
            }
            
            return (
              <div key={index} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${bgColor}`}>
                    {completed || "-"}
                  </span>
                  <span className="flex-1" />
                  <span className="font-medium truncate">{item["Article number"]}</span>
                </div>
              </div>
            )
          })}
        </div>
        {showScrollLabel && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card via-card/80 to-transparent pt-6 pb-2 text-center pointer-events-none">
            <span className="text-xs text-muted-foreground font-medium">Scroll to see more</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function PeopleDataContent({
  globalFilter,
  onGlobalFilterChange,
}: PeopleDataContentProps) {
  const {
    data,
    message,
    isLoading,
    error,
    dateFilter,
    setDateFilter,
    groupedByPerson,
    refetch: refetchFromHook,
    isRefetching: isRefetchingFromHook,
  } = useFilteredLastTwoDaysFilesData()
  const [copied, setCopied] = useState(false)

  const handleCopyAllRows = async () => {
    if (data.length === 0) return
    
    // Sort by Done by (name), then by Article number
    const sortedRows = [...data].sort((a, b) => {
      const nameA = (a["Done by"] || "").toLowerCase()
      const nameB = (b["Done by"] || "").toLowerCase()
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB)
      }
      return a["Article number"].localeCompare(b["Article number"])
    })
    
    // Format: ARTICLE NUMBER NAME (one per line)
    const textToCopy = sortedRows
      .map((row) => `${row["Article number"]} ${row["Done by"] || ""}`.trim())
      .join("\n")
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Date Filter Buttons Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Overview Section Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[250px] w-full" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* People Cards Section Skeleton */}
        <div className="w-full">
          <Skeleton className="h-5 w-24 mb-2" />
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2">
              <Skeleton className="h-[400px] w-[280px] shrink-0 rounded-lg" />
              <Skeleton className="h-[400px] w-[280px] shrink-0 rounded-lg" />
              <Skeleton className="h-[400px] w-[280px] shrink-0 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Table Section Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 py-3 border-b rounded-t-md">
              <Skeleton className="h-10 flex-[2] min-w-0" />
              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 shrink-0">
                <Skeleton className="h-9 w-full sm:w-24" />
                <Skeleton className="h-9 w-full sm:w-20" />
              </div>
            </div>
            <div className="rounded-b-md border-x border-b">
              <div className="overflow-x-auto">
                <div className="p-4 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorCard
        error={error}
        onRetry={() => refetchFromHook()}
        retryLabel={isRefetchingFromHook ? "Retrying..." : "Try Again"}
      />
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        {/* Date Filter Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={dateFilter === "today" ? "default" : "outline"}
            onClick={() => setDateFilter("today")}
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button
            variant={dateFilter === "yesterday" ? "default" : "outline"}
            onClick={() => setDateFilter("yesterday")}
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Yesterday
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
      {/* Date Filter Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant={dateFilter === "today" ? "default" : "outline"}
          onClick={() => setDateFilter("today")}
          size="sm"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Today
        </Button>
        <Button
          variant={dateFilter === "yesterday" ? "default" : "outline"}
          onClick={() => setDateFilter("yesterday")}
          size="sm"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Yesterday
        </Button>
      </div>

      {/* Top Row: People Stats and Bar Chart */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* People Stats */}
          <Card>
            <CardHeader>
              <CardTitle>People Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(groupedByPerson)
                  .sort(([, a], [, b]) => b.length - a.length)
                  .map(([personName, items]) => (
                    <div key={personName} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                      <span className="font-medium">{personName}</span>
                      <span className="text-muted-foreground">{items.length} {items.length === 1 ? "article" : "articles"}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <PeopleChart data={data} />
        </div>
      </div>

      {/* Cards in Horizontal Scroll */}
      {Object.keys(groupedByPerson).length > 0 && (
        <div className="w-full">
          <h3 className="text-sm font-semibold mb-2">People Cards</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2" style={{ minWidth: "max-content" }}>
              {Object.entries(groupedByPerson).map(([personName, items]) => (
                <PersonCard key={personName} personName={personName} items={items} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Data Table</h3>
        <div className="space-y-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 py-3 border-b rounded-t-md">
            <Input
              placeholder="Search across all columns..."
              value={globalFilter}
              onChange={(event) => onGlobalFilterChange(event.target.value)}
              className="flex-[2] min-w-0"
            />
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 shrink-0">
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
                disabled={data.length === 0}
                title="Copy article numbers and names (sorted by name)"
                className="w-full sm:w-auto"
                size="sm"
              >
                <Copy className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                <span className="sm:hidden">{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>
          <PeopleDataTable
            data={data}
            globalFilter={globalFilter}
          />
        </div>
      </div>
    </div>
  )
}

export function PeopleDataContentWithChart({
  globalFilter,
  onGlobalFilterChange,
}: PeopleDataContentProps) {
  // This wrapper is no longer needed as PeopleDataContent now includes the chart
  return (
    <PeopleDataContent
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
    />
  )
}
