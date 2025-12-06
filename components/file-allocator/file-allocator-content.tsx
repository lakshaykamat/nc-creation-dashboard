"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFileAllocator } from "@/hooks/file-allocator/use-file-allocator"
import { compressToBase64 } from "@/lib/common/compress-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorCard } from "@/components/common/error-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function FileAllocatorContent() {
  const router = useRouter()
  const [emailIndex, setEmailIndex] = useState<number | null>(null)
  const isLatest = emailIndex === null
  
  const { data, isLoading, error, refetch, isRefetching } = useFileAllocator(
    isLatest,
    emailIndex ?? undefined
  )
  
  // Toggle to show/hide "Coming Soon" card
  const showComingSoon = false

  const handlePreviousEmail = () => {
    if (isLatest) {
      setEmailIndex(1)
    } else {
      setEmailIndex((prev) => (prev ?? 0) + 1)
    }
  }

  const handleNextEmail = () => {
    if (emailIndex === null) return
    if (emailIndex === 1) {
      setEmailIndex(null) // Go back to latest
    } else {
      setEmailIndex((prev) => Math.max(1, (prev ?? 1) - 1))
    }
  }

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "-"
    try {
      const date = new Date(dateStr)
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return dateStr
    }
  }

  const getEmailPosition = (): string => {
    if (isLatest) {
      return "Latest"
    }
    return `#${emailIndex! + 1}`
  }

  const parseArticlesWithPages = (articles: string[]) => {
    return articles.map((article) => {
      // Parse format: "CDC101217 [24]" -> { articleId: "CDC101217", pages: "24" }
      const match = article.match(/^(.+?)\s*\[(\d+)\]$/)
      if (match) {
        return {
          articleId: match[1].trim(),
          pages: match[2],
        }
      }
      // Fallback if format doesn't match
      return {
        articleId: article,
        pages: "0",
      }
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorCard
        error={error}
        onRetry={() => refetch()}
        retryLabel={isRefetching ? "Retrying..." : "Try Again"}
      />
    )
  }

  if (!data) {
    return (
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
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 relative">
      {showComingSoon && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background shadow-2xl backdrop-blur-sm pointer-events-auto w-full max-w-2xl mx-4">
            <CardContent className="pt-8 pb-8 px-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  {/* <div className="rounded-full bg-primary/20 p-4">
                    <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                  </div> */}
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-primary tracking-wide">Send a kiss if you want access</h3>
                  <p className="text-base text-muted-foreground max-w-md mx-auto">
                    This feature is currently under development and will be available soon. Stay tuned for updates!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-10 gap-4 ${showComingSoon ? "opacity-30 pointer-events-none" : ""}`}>
        <Card className="flex flex-col min-h-[400px] max-h-[600px] lg:col-span-3">
          <CardHeader className="shrink-0">
            <CardTitle>New Allocations ({data.totalNewArticles})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {data.newArticlesWithPages && data.newArticlesWithPages.length > 0 ? (
              <div className="rounded-md border h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>Article ID</TableHead>
                      <TableHead className="text-right">Pages</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parseArticlesWithPages(data.newArticlesWithPages).map((item, index) => (
                      <TableRow key={`${item.articleId}-${index}`}>
                        <TableCell className="font-medium">{item.articleId}</TableCell>
                        <TableCell className="text-right">{item.pages}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2 p-6">
                  <p className="text-sm text-muted-foreground">
                    {data.emailArticles && data.emailArticles.length === 0
                      ? "No articles found in email."
                      : "All articles have already been allocated."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-[400px] max-h-[600px] lg:col-span-7">
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>Email</CardTitle>
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  {getEmailPosition()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDate(data.emailDate)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden mb-4">
              {data.html ? (
                <div className="border rounded-lg overflow-hidden bg-muted/30 h-full">
                  <iframe
                    srcDoc={data.html}
                    className="w-full h-full border-0"
                    title="Allocation Details HTML"
                    sandbox="allow-same-origin"
                  />
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-center gap-2 pt-4 border-t shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousEmail}
                disabled={isRefetching || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextEmail}
                disabled={isRefetching || isLoading || isLatest}
              >
                Next Email
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.newArticlesWithPages && data.newArticlesWithPages.length > 0 && (
        <div className={`flex justify-center ${showComingSoon ? "opacity-30 pointer-events-none" : ""}`}>
          <Button
            size="lg"
            className="h-12 px-8 text-base font-semibold"
            onClick={() => {
              // Compress and encode newArticlesWithPages array using LZ-String
              const jsonString = JSON.stringify(data.newArticlesWithPages)
              const compressedData = compressToBase64(jsonString)
              router.push(`/file-allocator/form?data=${encodeURIComponent(compressedData)}`)
            }}
          >
            Allocate New Articles
          </Button>
        </div>
      )}
    </div>
  )
}

