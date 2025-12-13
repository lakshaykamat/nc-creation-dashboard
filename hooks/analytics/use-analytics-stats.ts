/**
 * Hook for fetching analytics statistics
 * 
 * @module hooks/analytics/use-analytics-stats
 */

import { useQuery } from "@tanstack/react-query"
import { getApiHeaders } from "@/lib/api/api-client"
import { formatDateInIndianTime } from "@/lib/utils/date-utils"

export interface TimeSeriesDataPoint {
  date: string
  formAllocations: number
  refs?: Record<string, number>
}

export interface AnalyticsStatsResponse {
  timeSeriesData: TimeSeriesDataPoint[]
  formAllocationCount: number
}

export type TimeFilter = "6h" | "24h" | "3d" | "7d"

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

export function useAnalyticsStats(timeFilter: TimeFilter) {
  const query = useQuery<AnalyticsStatsResponse>({
    queryKey: ["analytics-stats", timeFilter],
    queryFn: () => fetchAnalyticsStats(timeFilter),
    refetchOnWindowFocus: false,
    retry: 1,
  })

  const chartData = query.data?.timeSeriesData.map((item) => ({
    ...item,
    date: formatDateInIndianTime(item.date),
  })) || []

  return {
    ...query,
    chartData,
  }
}

