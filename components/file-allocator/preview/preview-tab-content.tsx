/**
 * Preview Tab Content Component
 * 
 * Displays the preview table with editable rows and paste functionality.
 * 
 * @module components/file-allocator/preview-tab-content
 */

"use client"

import { useRef } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PreviewTableRow } from "./preview-table-row"
import { PreviewMessage } from "./preview-message"
import type { AllocatedArticle } from "@/types/file-allocator"

interface PreviewTabContentProps {
  displayArticles: AllocatedArticle[]
  manuallyAddedArticleIds: Set<string>
  editingCell: { articleId: string; field: keyof AllocatedArticle } | null
  editValue: string
  inputRef: React.RefObject<HTMLInputElement | null>
  editMessage: { type: "success" | "error"; text: string } | null
  onCellClick: (articleId: string, field: keyof AllocatedArticle, value: string | number) => void
  onValueChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
  onDelete?: (articleId: string) => void
  onTablePaste: (e: React.ClipboardEvent) => void
}

export function PreviewTabContent({
  displayArticles,
  manuallyAddedArticleIds,
  editingCell,
  editValue,
  inputRef,
  editMessage,
  onCellClick,
  onValueChange,
  onSave,
  onCancel,
  onDelete,
  onTablePaste,
}: PreviewTabContentProps) {
  const tableRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="space-y-2 mb-2 shrink-0">
        <p className="text-xs text-muted-foreground">
          Click on the table and paste data to automatically detect articles
        </p>
        <PreviewMessage message={editMessage} />
      </div>
      <div
        ref={tableRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-auto rounded-md border-2 border-border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onPaste={onTablePaste}
        tabIndex={0}
        role="table"
        aria-label="Allocation preview table - paste data here"
      >
        <div className="min-w-full pb-4">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-sm border-b-2">
              <TableRow className="hover:bg-muted/50">
                <TableHead className="font-semibold bg-muted/95 px-3 py-3 min-w-[100px]">Month</TableHead>
                <TableHead className="font-semibold bg-muted/95 px-3 py-3 min-w-[120px]">Date</TableHead>
                <TableHead className="font-semibold bg-muted/95 px-3 py-3 min-w-[150px]">Name</TableHead>
                <TableHead className="font-semibold bg-muted/95 px-3 py-3 min-w-[180px] sm:min-w-[200px]">Article</TableHead>
                <TableHead className="text-right font-semibold bg-muted/95 px-3 py-3 min-w-[80px]">Pages</TableHead>
                {onDelete && <TableHead className="font-semibold bg-muted/95 px-3 py-3 w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayArticles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={onDelete ? 6 : 5} className="text-center py-12 text-muted-foreground">
                    No articles to display. Paste data into the table to add articles.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {displayArticles.map((article, index) => (
                    <PreviewTableRow
                      key={`${article.name}-${article.articleId}-${index}`}
                      article={article}
                      index={index}
                      isManuallyAdded={manuallyAddedArticleIds.has(article.articleId)}
                      editingCell={editingCell}
                      editValue={editValue}
                      inputRef={inputRef}
                      onCellClick={onCellClick}
                      onValueChange={onValueChange}
                      onSave={onSave}
                      onCancel={onCancel}
                      onDelete={onDelete}
                    />
                  ))}
                  {/* Spacer row to ensure last row is fully visible */}
                  <TableRow className="h-4">
                    <TableCell colSpan={onDelete ? 6 : 5} className="p-0 border-0"></TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

