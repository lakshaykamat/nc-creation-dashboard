/**
 * Analytics Content Component
 * 
 * Displays analytics logs from MongoDB
 * 
 * @module components/analytics/analytics-content
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorCard } from "@/components/common/error-card"
import { getApiHeaders } from "@/lib/api/api-client"

interface AnalyticsLog {
  _id: string
  domain: string
  timestamp: Date
  date: string
  time: string
  urlPath: string
  [key: string]: unknown
}

interface AnalyticsLogsResponse {
  logs: AnalyticsLog[]
  totalCount: number
  limit: number
  skip: number
}

async function fetchAnalyticsLogs(domain?: string, limit = 100): Promise<AnalyticsLogsResponse> {
  const params = new URLSearchParams()
  if (domain) {
    params.append("domain", domain)
  }
  params.append("limit", limit.toString())

  const response = await fetch(`/api/analytics/logs?${params.toString()}`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to fetch analytics logs" }))
    throw new Error(error.message || "Failed to fetch analytics logs")
  }

  return response.json()
}

export function AnalyticsContent() {
  const [domainFilter, setDomainFilter] = useState<string>("all")
  const [limit, setLimit] = useState(100)

  const { data, isLoading, isError, error } = useQuery<AnalyticsLogsResponse>({
    queryKey: ["analytics-logs", domainFilter, limit],
    queryFn: () => fetchAnalyticsLogs(domainFilter === "all" ? undefined : domainFilter, limit),
    refetchOnWindowFocus: false,
    retry: 1,
  })

  // Extract unique domains from logs
  const availableDomains = Array.from(
    new Set(data?.logs.map(log => log.domain) || [])
  ).sort()

  if (isError) {
    return (
      <ErrorCard
        error={{
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter analytics logs by domain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domain-filter">Domain</Label>
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger id="domain-filter">
                  <SelectValue placeholder="All domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All domains</SelectItem>
                  {availableDomains.map(domain => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Limit</Label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="1000"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10) || 100)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Logs</CardTitle>
          <CardDescription>
            {data ? `${data.totalCount} total logs` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !data || data.logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium">No logs found</p>
              <p className="text-sm text-muted-foreground">
                {domainFilter !== "all"
                  ? `No logs found for domain "${domainFilter}"`
                  : "No analytics logs available"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>URL Path</TableHead>
                    <TableHead>Summary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{log.date}</span>
                          <span className="text-sm text-muted-foreground">{log.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{log.domain}</span>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {log.urlPath}
                        </code>
                      </TableCell>
                      <TableCell>
                        {log.summary && typeof log.summary === "object" ? (
                          <div className="text-sm space-y-1">
                            {(() => {
                              const summary = log.summary as Record<string, unknown>
                              const totalArticles = summary.totalArticles
                              if (totalArticles && (typeof totalArticles === "number" || typeof totalArticles === "string")) {
                                return (
                                  <div>
                                    <span className="text-muted-foreground">Articles: </span>
                                    <span className="font-medium">{String(totalArticles)}</span>
                                  </div>
                                )
                              }
                              return null
                            })()}
                            {(() => {
                              const summary = log.summary as Record<string, unknown>
                              const totalPages = summary.totalPages
                              if (totalPages && (typeof totalPages === "number" || typeof totalPages === "string")) {
                                return (
                                  <div>
                                    <span className="text-muted-foreground">Pages: </span>
                                    <span className="font-medium">{String(totalPages)}</span>
                                  </div>
                                )
                              }
                              return null
                            })()}
                            {(() => {
                              const summary = log.summary as Record<string, unknown>
                              const totalPersonAllocations = summary.totalPersonAllocations
                              if (totalPersonAllocations !== undefined && (typeof totalPersonAllocations === "number" || typeof totalPersonAllocations === "string")) {
                                return (
                                  <div>
                                    <span className="text-muted-foreground">Allocations: </span>
                                    <span className="font-medium">{String(totalPersonAllocations)}</span>
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

