"use client"

import { useFileAllocator, FileAllocatorError } from "@/hooks/use-file-allocator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, Calendar, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function FileAllocatorContent() {
  const { data, isLoading, error, refetch, isRefetching } = useFileAllocator()
  
  // Toggle to show/hide "Coming Soon" card
  const showComingSoon = true

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "-"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
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
    const errorObj = error as unknown as Record<string, unknown>
    const errorData: Partial<FileAllocatorError> = {
      code: typeof errorObj.code === "number" ? errorObj.code : undefined,
      message: typeof errorObj.message === "string" ? errorObj.message : "An error occurred",
      hint: typeof errorObj.hint === "string" ? errorObj.hint : undefined,
    }

    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 shrink-0 mt-0.5">
            <svg
              className="h-3.5 w-3.5 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-destructive">
              {errorData.code && <span className="mr-2">{errorData.code}</span>}
              Error Loading Data
            </h3>
            {errorData.message && (
              <p className="text-sm text-muted-foreground mt-1.5">{errorData.message}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="mt-3"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        </div>
      </div>
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

      <div className={`flex items-center justify-between ${showComingSoon ? "opacity-30 pointer-events-none" : ""}`}>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <span className="text-sm text-muted-foreground">Email Date: </span>
            <span className="text-sm font-medium">{formatDate(data.emailDate)}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-10 gap-4 ${showComingSoon ? "opacity-30 pointer-events-none" : ""}`}>
        {data.newArticlesWithPages && data.newArticlesWithPages.length > 0 && (
          <Card className="flex flex-col max-h-[600px] lg:col-span-3">
            <CardHeader className="shrink-0">
              <CardTitle>New Allocations ({data.totalNewArticles})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
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
            </CardContent>
          </Card>
        )}

        <Card className="flex flex-col max-h-[600px] lg:col-span-7">
          <CardHeader className="shrink-0">
            <CardTitle>Allocation Details</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="h-full">
              {data.html && (
                <div className="border rounded-lg overflow-hidden bg-muted/30 h-full">
                  <iframe
                    srcDoc={data.html}
                    className="w-full h-full border-0"
                    title="Allocation Details HTML"
                    sandbox="allow-same-origin"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

