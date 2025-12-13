/**
 * Analytics Content Component
 * 
 * Displays analytics with a minimal line chart
 * 
 * @module components/analytics/analytics-content
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorCard } from "@/components/common/error-card"
import { getApiHeaders } from "@/lib/api/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { formatDateInIndianTime } from "@/lib/utils/date-utils"

interface TimeSeriesDataPoint {
  date: string
  formAllocations: number
}

interface AnalyticsStatsResponse {
  timeSeriesData: TimeSeriesDataPoint[]
  formAllocationCount: number
}

type TimeFilter = "6h" | "24h" | "3d" | "7d"

async function fetchAnalyticsStats(timeFilter: TimeFilter = "7d"): Promise<AnalyticsStatsResponse> {
  const params = new URLSearchParams({ timeFilter })
  const response = await fetch(`/api/analytics/stats?${params.toString()}`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to fetch analytics stats" }))
    throw new Error(error.message || "Failed to fetch analytics stats")
  }

  return response.json()
}

const chartConfig = {
  formAllocations: {
    label: "Form Allocations",
    color: "hsl(142.1 76.2% 36.3%)",
  },
} satisfies ChartConfig

export function AnalyticsContent() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d")

  const { data, isLoading, isError, error } = useQuery<AnalyticsStatsResponse>({
    queryKey: ["analytics-stats", timeFilter],
    queryFn: () => fetchAnalyticsStats(timeFilter),
    refetchOnWindowFocus: false,
    retry: 1,
  })

  if (isError) {
    return (
      <ErrorCard
        error={{
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        }}
      />
    )
  }

  const chartData = data?.timeSeriesData.map((item) => ({
    ...item,
    date: formatDateInIndianTime(item.date),
  })) || []

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      {data && (
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Article Allocator Form</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.formAllocationCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Form submissions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Line Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Form allocations over time</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="time-filter" className="text-sm whitespace-nowrap">Time Period:</Label>
              <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
                <SelectTrigger id="time-filter" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6h">Last 6 hours</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="3d">Last 3 days</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[400px] w-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
              <p>No data available</p>
            </div>
          ) : (
            <div className="w-full min-w-0">
              <ChartContainer config={chartConfig} className="h-[400px] w-full min-w-0 [&>div]:w-full">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="formAllocations"
                    stroke="var(--color-formAllocations)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
