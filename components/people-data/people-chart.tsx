"use client"

import { useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import type { LastTwoDaysFileData } from "@/types/portal-data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface PeopleChartProps {
  data: LastTwoDaysFileData[]
}

export function PeopleChart({ data }: PeopleChartProps) {
  // Group data by "Done by" and count articles (case-insensitive, trimmed)
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {}
    const nameMap: Record<string, string> = {} // Maps normalized name to original name
    
    data.forEach((item) => {
      const originalName = item["Done by"] || "Unknown"
      const normalizedName = originalName.trim().toLowerCase() || "unknown"
      
      // Use the first occurrence's original name as the display name
      if (!nameMap[normalizedName]) {
        nameMap[normalizedName] = originalName.trim() || "Unknown"
      }
      
      grouped[normalizedName] = (grouped[normalizedName] || 0) + 1
    })

    // Convert to array with original names and sort by count (descending)
    return Object.entries(grouped)
      .map(([normalizedKey, count]) => ({
        name: nameMap[normalizedKey],
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [data])

  const chartConfig = {
    count: {
      label: "Articles",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Articles by Person</CardTitle>
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
        <CardTitle>Articles by Person</CardTitle>
        <CardDescription>
          {data.length} {data.length === 1 ? "article" : "articles"} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: -20,
            }}
          >
            <XAxis type="number" dataKey="count" hide />
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
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

