/**
 * Analytics Stats Cards Component
 * 
 * @module components/analytics/analytics-stats-cards
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TimeFilter = "6h" | "24h" | "3d" | "7d"

interface AnalyticsStatsCardsProps {
  totalAllocations: number | undefined
  timeFilter: TimeFilter
  onTimeFilterChange: (value: TimeFilter) => void
  isLoading: boolean
}

export function AnalyticsStatsCards({
  totalAllocations,
  timeFilter,
  onTimeFilterChange,
  isLoading,
}: AnalyticsStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-3xl font-bold">{totalAllocations || 0}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Time Period</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={timeFilter} onValueChange={onTimeFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">Last 6 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="3d">Last 3 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}

