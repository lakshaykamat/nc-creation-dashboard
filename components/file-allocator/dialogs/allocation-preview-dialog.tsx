/**
 * Allocation Preview Dialog Component
 * 
 * Displays a dialog with the allocation preview table.
 * The table shows allocated and unallocated articles with scrollable content.
 * 
 * @module components/file-allocator/allocation-preview-dialog
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { usePreviewDialogState } from "@/hooks/file-allocator/use-preview-dialog-state"
import { PreviewTabContent } from "../preview/preview-tab-content"
import { EditTabContent } from "../preview/edit-tab-content"
import type { AllocatedArticle } from "@/types/file-allocator"

interface AllocationPreviewDialogProps {
  displayArticles: AllocatedArticle[]
  disabled?: boolean
  manuallyAddedArticleIds?: Set<string>
  onUpdateFromPastedData?: (text: string) => { success: boolean; message: string }
  onDeleteArticle?: (articleId: string) => void
  onUpdateArticle?: (articleId: string, field: keyof AllocatedArticle, value: string | number) => void
}

/**
 * Renders a dialog with the allocation preview table.
 * 
 * @param props - Component props
 * @param props.displayArticles - Array of articles to display (allocated + unallocated)
 * @param props.disabled - Whether the button should be disabled
 */
export function AllocationPreviewDialog({
  displayArticles,
  disabled = false,
  manuallyAddedArticleIds = new Set(),
  onUpdateFromPastedData,
  onDeleteArticle,
  onUpdateArticle,
}: AllocationPreviewDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    pastedText,
    setPastedText,
    editMessage,
    editingCell,
    editValue,
    setEditValue,
    textareaRef,
    inputRef,
    handleCellClick,
    handleSaveEdit,
    handleCancelEdit,
    handleTablePaste,
    handleApply,
    clearMessage,
    adjustTextareaHeight,
  } = usePreviewDialogState({ onUpdateFromPastedData })

  // Auto-resize textarea when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(adjustTextareaHeight, 0)
    }
  }, [open, adjustTextareaHeight])

  // Handle saving edited value and call onUpdateArticle
  const handleSaveWithUpdate = () => {
    if (!editingCell || !onUpdateArticle) {
      handleSaveEdit()
      return
    }

    const newValue = editingCell.field === "pages" ? Number(editValue) || 0 : editValue
    onUpdateArticle(editingCell.articleId, editingCell.field, newValue)
    handleSaveEdit()
  }

  // Wrap handleCellClick to check if update is enabled
  const handleCellClickWithCheck = (articleId: string, field: keyof AllocatedArticle, value: string | number) => {
    if (!onUpdateArticle) return
    handleCellClick(articleId, field, value)
  }

  // Handle pasted text change - clear message
  const handlePastedTextChange = (text: string) => {
    setPastedText(text)
    clearMessage()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 text-base font-semibold"
          disabled={disabled}
        >
          Preview or Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Preview or Edit</DialogTitle>
          <DialogDescription className="text-sm">
            Review how articles are allocated before submitting
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="preview" className="flex-1 cursor-pointer">Preview</TabsTrigger>
            <TabsTrigger value="edit" className="flex-1 cursor-pointer">Edit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="flex-1 flex flex-col min-h-0 mt-4 overflow-hidden">
            <PreviewTabContent
              displayArticles={displayArticles}
              manuallyAddedArticleIds={manuallyAddedArticleIds}
              editingCell={editingCell}
              editValue={editValue}
              inputRef={inputRef}
              editMessage={editMessage}
              onCellClick={handleCellClickWithCheck}
              onValueChange={setEditValue}
              onSave={handleSaveWithUpdate}
              onCancel={handleCancelEdit}
              onDelete={onDeleteArticle}
              onTablePaste={handleTablePaste}
            />
          </TabsContent>

          <TabsContent value="edit" className="flex-1 flex flex-col min-h-0 mt-4 overflow-hidden">
            <EditTabContent
              pastedText={pastedText}
              setPastedText={handlePastedTextChange}
              editMessage={editMessage}
              onApply={handleApply}
              isDisabled={!onUpdateFromPastedData}
              textareaRef={textareaRef}
              adjustTextareaHeight={adjustTextareaHeight}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
