/**
 * Recent Allocations Table Component
 * 
 * @module components/analytics/recent-allocations-table
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

export interface AllocationLog {
  _id: string
  domain: string
  timestamp: string
  urlPath: string
  summary?: {
    totalPersonAllocations: number
    totalDdnArticles: number
    totalUnallocatedArticles: number
    personNames: string[]
    totalArticles: number
    totalPages: number
  }
  formData?: {
    personAllocations: Array<{
      person: string
      articles: Array<{
        articleId: string
        pages: number
      }>
    }>
    ddnArticles: Array<{
      articleId: string
      pages: number
    }>
    unallocatedArticles: Array<{
      articleId: string
      pages: number
    }>
  }
}

interface RecentAllocationsTableProps {
  logs: AllocationLog[]
  isLoading: boolean
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " IST"
}

export function RecentAllocationsTable({ logs, isLoading }: RecentAllocationsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyJson = async (log: AllocationLog) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(log, null, 2))
      setCopiedId(log._id)
      toast.success("JSON copied to clipboard")
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error("Failed to copy JSON")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Allocations</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !logs.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No allocations found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Time</TableHead>
                  <TableHead>Submitted Data</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const summary = log.summary
                  const formData = log.formData
                  
                  const personAllocations = formData?.personAllocations || []
                  const ddnCount = formData?.ddnArticles?.length || 0
                  const unallocatedCount = summary?.totalUnallocatedArticles || 0
                  
                  return (
                    <TableRow key={log._id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(() => {
                            const parts: string[] = []
                            
                            if (personAllocations.length > 0) {
                              const peopleList = personAllocations
                                .map((alloc) => `${alloc.person} (${alloc.articles.length} articles)`)
                                .join(", ")
                              parts.push(`Allocated to ${peopleList}`)
                            }
                            
                            if (ddnCount > 0) {
                              parts.push(`${ddnCount} DDN article${ddnCount > 1 ? "s" : ""}`)
                            }
                            
                            if (unallocatedCount > 0) {
                              parts.push(`${unallocatedCount} article${unallocatedCount > 1 ? "s" : ""} need allocation`)
                            }
                            
                            if (parts.length === 0) {
                              return <span className="text-muted-foreground">No allocation data</span>
                            }
                            
                            return (
                              <span>
                                {parts.map((part, i) => (
                                  <span key={i}>
                                    {i > 0 && <span className="text-muted-foreground"> · </span>}
                                    {part}
                                  </span>
                                ))}
                                {summary?.totalPages && (
                                  <span className="text-muted-foreground">
                                    {" "}({summary.totalPages} pages)
                                  </span>
                                )}
                              </span>
                            )
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleCopyJson(log)}
                          title="Copy JSON"
                        >
                          {copiedId === log._id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

