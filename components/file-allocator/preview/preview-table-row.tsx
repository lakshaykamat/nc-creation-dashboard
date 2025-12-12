/**
 * Editable Table Row Component
 * 
 * Renders a single row in the preview table with editable cells.
 * 
 * @module components/file-allocator/preview-table-row
 */

"use client"

import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { TrashIcon } from "lucide-react"
import { PreviewTableCell } from "./preview-table-cell"
import type { AllocatedArticle } from "@/types/file-allocator"

interface PreviewTableRowProps {
  article: AllocatedArticle
  index: number
  isManuallyAdded: boolean
  editingCell: { articleId: string; field: keyof AllocatedArticle } | null
  editValue: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onCellClick: (articleId: string, field: keyof AllocatedArticle, value: string | number) => void
  onValueChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
  onDelete?: (articleId: string) => void
}

export function PreviewTableRow({
  article,
  index,
  isManuallyAdded,
  editingCell,
  editValue,
  inputRef,
  onCellClick,
  onValueChange,
  onSave,
  onCancel,
  onDelete,
}: PreviewTableRowProps) {
  const isEditing = editingCell?.articleId === article.articleId
  const isEditingMonth = isEditing && editingCell.field === "month"
  const isEditingDate = isEditing && editingCell.field === "date"
  const isEditingName = isEditing && editingCell.field === "name"
  const isEditingArticleId = isEditing && editingCell.field === "articleId"
  const isEditingPages = isEditing && editingCell.field === "pages"

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(article.articleId)
    }
  }

  return (
    <TableRow
      key={`${article.name}-${article.articleId}-${index}`}
      className={`${isManuallyAdded ? "bg-blue-50/50 dark:bg-blue-950/20" : ""} hover:bg-muted/30 transition-colors`}
    >
      <PreviewTableCell
        articleId={article.articleId}
        field="month"
        value={article.month || ""}
        isEditing={isEditingMonth}
        editValue={editValue}
        inputRef={inputRef}
        onCellClick={onCellClick}
        onValueChange={onValueChange}
        onSave={onSave}
        onCancel={onCancel}
        className="font-medium"
      />
      <PreviewTableCell
        articleId={article.articleId}
        field="date"
        value={article.date || ""}
        isEditing={isEditingDate}
        editValue={editValue}
        inputRef={inputRef}
        onCellClick={onCellClick}
        onValueChange={onValueChange}
        onSave={onSave}
        onCancel={onCancel}
      />
      <PreviewTableCell
        articleId={article.articleId}
        field="name"
        value={article.name || ""}
        isEditing={isEditingName}
        editValue={editValue}
        inputRef={inputRef}
        onCellClick={onCellClick}
        onValueChange={onValueChange}
        onSave={onSave}
        onCancel={onCancel}
        className="font-medium"
      />
      {isEditingArticleId ? (
        <PreviewTableCell
          articleId={article.articleId}
          field="articleId"
          value={article.articleId}
          isEditing={true}
          editValue={editValue}
          inputRef={inputRef}
          onCellClick={onCellClick}
          onValueChange={onValueChange}
          onSave={onSave}
          onCancel={onCancel}
          className="whitespace-normal max-w-[200px] sm:max-w-none"
        />
      ) : (
        <TableCell className="px-3 py-3 whitespace-normal max-w-[200px] sm:max-w-none">
          <div
            className="flex items-center gap-2 flex-wrap cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 py-0.5"
            onClick={() => onCellClick(article.articleId, "articleId", article.articleId)}
          >
            <span className="font-mono text-sm">{article.articleId}</span>
            {isManuallyAdded && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium shrink-0">
                Manual
              </span>
            )}
          </div>
        </TableCell>
      )}
      <PreviewTableCell
        articleId={article.articleId}
        field="pages"
        value={article.pages}
        isEditing={isEditingPages}
        editValue={editValue}
        inputRef={inputRef}
        onCellClick={onCellClick}
        onValueChange={onValueChange}
        onSave={onSave}
        onCancel={onCancel}
        type="number"
        align="right"
        className="font-medium"
      />
      {onDelete && (
        <TableCell className="px-2 py-3 w-[50px]">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </TableCell>
      )}
    </TableRow>
  )
}

