/**
 * Analytics Content Component
 * 
 * @module components/analytics/analytics-content
 */

"use client"

import { useState } from "react"
import { ErrorCard } from "@/components/common/error-card"
import { AnalyticsStatsCards } from "./analytics-stats-cards"
import { AnalyticsChart } from "./analytics-chart"
import { RecentAllocationsTable } from "./recent-allocations-table"
import { useAnalyticsStats, type TimeFilter } from "@/hooks/analytics/use-analytics-stats"
import { useRecentAllocations } from "@/hooks/analytics/use-recent-allocations"

export function AnalyticsContent() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d")

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErr,
    chartData,
  } = useAnalyticsStats(timeFilter)

  const {
    data: allocationsData,
    isLoading: allocationsLoading,
    isError: allocationsError,
    error: allocationsErr,
  } = useRecentAllocations()

  if (statsError || allocationsError) {
    return (
      <ErrorCard
        error={{
          message: (statsErr || allocationsErr) instanceof Error 
            ? (statsErr || allocationsErr)?.message 
            : "An unexpected error occurred",
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <AnalyticsStatsCards
        totalAllocations={statsData?.formAllocationCount}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        isLoading={statsLoading}
      />

      <AnalyticsChart data={chartData} isLoading={statsLoading} />

      <RecentAllocationsTable 
        logs={allocationsData?.logs || []} 
        isLoading={allocationsLoading}
      />
    </div>
  )
}
