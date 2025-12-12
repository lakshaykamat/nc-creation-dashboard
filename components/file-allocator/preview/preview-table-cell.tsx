/**
 * Editable Table Cell Component
 * 
 * Renders a table cell that can be edited by clicking on it.
 * 
 * @module components/file-allocator/preview-table-cell
 */

"use client"

import { Input } from "@/components/ui/input"
import { TableCell } from "@/components/ui/table"
import type { AllocatedArticle } from "@/types/file-allocator"

interface PreviewTableCellProps {
  articleId: string
  field: keyof AllocatedArticle
  value: string | number
  isEditing: boolean
  editValue: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onCellClick: (articleId: string, field: keyof AllocatedArticle, value: string | number) => void
  onValueChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
  className?: string
  type?: "text" | "number"
  align?: "left" | "right" | "center"
}

export function PreviewTableCell({
  articleId,
  field,
  value,
  isEditing,
  editValue,
  inputRef,
  onCellClick,
  onValueChange,
  onSave,
  onCancel,
  className = "",
  type = "text",
  align = "left",
}: PreviewTableCellProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSave()
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  const cellClassName = `px-3 py-3 ${isEditing ? "" : "cursor-pointer hover:bg-muted/50"} ${align === "right" ? "text-right" : ""} ${className}`

  return (
    <TableCell className={cellClassName} onClick={() => onCellClick(articleId, field, value)}>
      {isEditing ? (
        <Input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onValueChange(e.target.value)}
          onBlur={onSave}
          onKeyDown={handleKeyDown}
          className={`h-8 text-sm ${align === "right" ? "text-right" : ""} ${field === "articleId" ? "font-mono" : ""}`}
          onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
        />
      ) : (
        <span className={field === "articleId" ? "font-mono text-sm" : ""}>
          {value || "—"}
        </span>
      )}
    </TableCell>
  )
}

