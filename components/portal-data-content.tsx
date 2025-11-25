"use client"

import { usePortalData, PortalDataError } from "@/hooks/use-portal-data"
import { PortalDataTable } from "@/components/portal-data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

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
  const { data, isLoading, error } = usePortalData()

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
      <div className="rounded-md border p-4 text-center text-muted-foreground">
        No data available
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
          size="icon"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <PortalDataTable
        data={data}
        globalFilter={globalFilter}
      />
    </div>
  )
}
