"use client"

import * as React from "react"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { AlertCircle, RefreshCw } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ErrorCard } from "@/components/common/error-card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface SheetDocument {
  _id: string
  Month: string
  Date: string
  "Article number": string
  Pages: number
  Completed: string
  "Done by": string
  Time: string
}

interface SheetResponse {
  success: boolean
  data: SheetDocument[]
  count: number
  error?: string
  message?: string
}

async function fetchSheetData(): Promise<SheetResponse> {
  const res = await fetch("/api/sheet", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
    credentials: "omit",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw {
      code: res.status,
      message: errorData.message || "Failed to fetch sheet data",
    }
  }

  return res.json()
}

function getQuarterAndYearFromDate(dateStr: string): { quarter: number; year: number } {
  if (!dateStr) return { quarter: 0, year: 0 }
  try {
    const parts = dateStr.split("/")
    if (parts.length !== 3) return { quarter: 0, year: 0 }
    const month = parseInt(parts[0], 10)
    const year = parseInt(parts[2], 10)
    
    let quarter = 0
    if (month >= 1 && month <= 3) quarter = 1
    else if (month >= 4 && month <= 6) quarter = 2
    else if (month >= 7 && month <= 9) quarter = 3
    else if (month >= 10 && month <= 12) quarter = 4
    
    return { quarter, year }
  } catch {
    return { quarter: 0, year: 0 }
  }
}

function QuarterChart({
  quarter,
  year,
  data,
}: {
  quarter: number
  year: number
  data: Array<{ name: string; pages: number }>
}) {
  const quarterLabels = ["", "Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"]

  const chartConfig = {
    pages: {
      label: "Pages",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{quarterLabels[quarter]} {year}</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data to display
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{quarterLabels[quarter]} {year}</CardTitle>
        <CardDescription>
          {data.reduce((sum, item) => sum + item.pages, 0)} pages total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: -20,
            }}
          >
            <XAxis type="number" dataKey="pages" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={100}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        <span className="font-medium">{data.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pages: {data.pages}
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            <Bar dataKey="pages" fill="var(--color-pages)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function SheetDataContent() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refetchFromHook,
    isRefetching: isRefetchingFromHook,
  } = useQuery<SheetResponse>({
    queryKey: ["sheet-data"],
    queryFn: fetchSheetData,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  // Group data by year, quarter and person, summing pages (case-insensitive)
  const quarterlyData = useMemo(() => {
    if (!data?.data) return {}

    // Structure: { year: { quarter: { normalizedName: { name, pages } } } }
    const dataByYearQuarter: Record<
      number,
      Record<
        number,
        Record<string, { name: string; pages: number }>
      >
    > = {}

    // Map to store normalized name -> original name (for consistent display)
    const nameMap: Record<
      number,
      Record<number, Record<string, string>>
    > = {}

    data.data.forEach((doc) => {
      const { quarter, year } = getQuarterAndYearFromDate(doc.Date)
      if (quarter === 0 || year === 0) return

      // Initialize year if not exists
      if (!dataByYearQuarter[year]) {
        dataByYearQuarter[year] = { 1: {}, 2: {}, 3: {}, 4: {} }
        nameMap[year] = { 1: {}, 2: {}, 3: {}, 4: {} }
      }

      const originalName = doc["Done by"]?.trim() || "Unallocated"
      const normalizedName = originalName.toLowerCase()
      const pages = doc.Pages || 0

      // Use normalized name as key for grouping (case-insensitive)
      if (!dataByYearQuarter[year][quarter][normalizedName]) {
        dataByYearQuarter[year][quarter][normalizedName] = { name: originalName, pages: 0 }
        nameMap[year][quarter][normalizedName] = originalName
      } else {
        // Use the first occurrence's original name as the display name
        dataByYearQuarter[year][quarter][normalizedName].name = nameMap[year][quarter][normalizedName]
      }
      dataByYearQuarter[year][quarter][normalizedName].pages += pages
    })

    // Convert to arrays and sort by pages (descending)
    const result: Record<
      number,
      Record<number, Array<{ name: string; pages: number }>>
    > = {}

    for (const year of Object.keys(dataByYearQuarter).map(Number).sort((a, b) => b - a)) {
      result[year] = { 1: [], 2: [], 3: [], 4: [] }
      for (const quarter of [1, 2, 3, 4] as const) {
        result[year][quarter] = Object.values(dataByYearQuarter[year][quarter]).sort(
          (a, b) => b.pages - a.pages
        )
      }
    }

    return result
  }, [data?.data])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorCard
        error={error}
        onRetry={() => refetchFromHook()}
        retryLabel={isRefetchingFromHook ? "Retrying..." : "Try Again"}
      />
    )
  }

  if (!data || !data.success) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            onClick={() => refetchFromHook()}
            disabled={isRefetchingFromHook}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isRefetchingFromHook ? "animate-spin" : ""
              }`}
            />
            Refresh
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
                {data?.message || "No data available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const count = data.count || 0

  if (count === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            onClick={() => refetchFromHook()}
            disabled={isRefetchingFromHook}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isRefetchingFromHook ? "animate-spin" : ""
              }`}
            />
            Refresh
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
                No data available.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get all years and sort descending (latest first)
  const years = Object.keys(quarterlyData)
    .map(Number)
    .sort((a, b) => b - a)

  if (years.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            onClick={() => refetchFromHook()}
            disabled={isRefetchingFromHook}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isRefetchingFromHook ? "animate-spin" : ""
              }`}
            />
            Refresh
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
                No data available.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show quarters for the most recent year by default, or all years if multiple
  const displayYear = years[0]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          onClick={() => refetchFromHook()}
          disabled={isRefetchingFromHook}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              isRefetchingFromHook ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((quarter) => (
          <QuarterChart
            key={quarter}
            quarter={quarter}
            year={displayYear}
            data={quarterlyData[displayYear]?.[quarter] || []}
          />
        ))}
      </div>
    </div>
  )
}
