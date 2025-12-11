/**
 * Allocation Articles Table Component
 * 
 * Displays table of new articles to be allocated
 * 
 * @module components/file-allocator/allocation-articles-table
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AllocationArticlesTableProps {
  articles: string[]
  totalNewArticles: number
}

export function AllocationArticlesTable({ articles, totalNewArticles }: AllocationArticlesTableProps) {
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

  const parsedArticles = parseArticlesWithPages(articles)

  return (
    <Card className="flex flex-col min-h-[400px] max-h-[600px] lg:col-span-3">
      <CardHeader className="shrink-0">
        <CardTitle>New Allocations ({totalNewArticles})</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {articles.length > 0 ? (
          <div className="rounded-md border h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Article ID</TableHead>
                  <TableHead className="text-right">Pages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedArticles.map((item, index) => (
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
                All articles have already been allocated.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

