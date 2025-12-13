/**
 * Analytics Chart Component
 * 
 * @module components/analytics/analytics-chart
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"

interface TimeSeriesDataPoint {
  date: string
  formAllocations: number
}

interface AnalyticsChartProps {
  data: TimeSeriesDataPoint[]
  isLoading: boolean
}

const chartConfig = {
  formAllocations: {
    label: "Allocations",
    color: "hsl(142.1 76.2% 36.3%)",
  },
} satisfies ChartConfig

export function AnalyticsChart({ data, isLoading }: AnalyticsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocations Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            <p>No data available</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="formAllocations"
                stroke="var(--color-formAllocations)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

