/**
 * Analytics Chart Component
 * 
 * @module components/analytics/analytics-chart
 */

"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"

interface TimeSeriesDataPoint {
  date: string
  formAllocations: number
  refs?: Record<string, number>
}

interface AnalyticsChartProps {
  data: TimeSeriesDataPoint[]
  isLoading: boolean
}

const REF_COLORS = [
  "hsl(142.1 76.2% 36.3%)", // green (default)
  "hsl(221.2 83.2% 53.3%)", // blue
  "hsl(346.8 77.2% 49.8%)", // red
  "hsl(47.9 95.8% 53.1%)",  // yellow
  "hsl(262.1 83.3% 57.8%)", // purple
  "hsl(199.4 89.1% 48.2%)", // cyan
]

function getRefColor(index: number): string {
  return REF_COLORS[index % REF_COLORS.length]
}

export function AnalyticsChart({ data, isLoading }: AnalyticsChartProps) {
  const { chartData, chartConfig, refKeys } = useMemo(() => {
    if (!data.length) {
      return { chartData: [], chartConfig: {}, refKeys: [] }
    }

    const allRefs = new Set<string>()
    data.forEach((point) => {
      if (point.refs) {
        Object.keys(point.refs).forEach((ref) => allRefs.add(ref))
      }
    })

    const refKeysArray = Array.from(allRefs).sort()
    
    const config: ChartConfig = {
      formAllocations: {
        label: "Total",
        color: REF_COLORS[0],
      },
    }

    refKeysArray.forEach((ref, index) => {
      config[`ref_${ref}`] = {
        label: ref === "none" ? "No Ref" : ref,
        color: getRefColor(index + 1),
      }
    })

    const processedData = data.map((point) => {
      const result: Record<string, unknown> = {
        date: point.date,
        formAllocations: point.formAllocations,
      }

      refKeysArray.forEach((ref) => {
        result[`ref_${ref}`] = point.refs?.[ref] || 0
      })

      return result
    })

    return {
      chartData: processedData,
      chartConfig: config,
      refKeys: refKeysArray,
    }
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocations Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            <p>No data available</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={chartData}>
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
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="formAllocations"
                stroke="var(--color-formAllocations)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              {refKeys.map((ref) => (
                <Line
                  key={ref}
                  type="monotone"
                  dataKey={`ref_${ref}`}
                  stroke={`var(--color-ref_${ref})`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray={ref === "none" ? "0" : "5 5"}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

