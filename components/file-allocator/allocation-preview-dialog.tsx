/**
 * Allocation Preview Dialog Component
 * 
 * Displays a dialog with the allocation preview table.
 * The table shows allocated and unallocated articles with scrollable content.
 * 
 * @module components/file-allocator/allocation-preview-dialog
 */

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { type AllocatedArticle } from "@/types/file-allocator"

interface AllocationPreviewDialogProps {
  displayArticles: AllocatedArticle[]
  disabled?: boolean
  manuallyAddedArticleIds?: Set<string>
  onUpdateFromPastedData?: (text: string) => { success: boolean; message: string }
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
}: AllocationPreviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [pastedText, setPastedText] = useState("")
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const newHeight = Math.min(textarea.scrollHeight, 400)
      textarea.style.height = `${newHeight}px`
    }
  }, [])

  useEffect(() => {
    if (open) {
      // Small delay to ensure textarea is rendered
      setTimeout(adjustTextareaHeight, 0)
    }
  }, [open, pastedText, adjustTextareaHeight])

  const handleApply = () => {
    if (!onUpdateFromPastedData) {
      setEditMessage({ type: "error", text: "Update function not available" })
      return
    }

    if (!pastedText.trim()) {
      setEditMessage({ type: "error", text: "Please paste allocation data" })
      return
    }

    const result = onUpdateFromPastedData(pastedText)
    setEditMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    })

    if (result.success) {
      // Clear textarea after successful update
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setPastedText("")
        setEditMessage(null)
      }, 2000)
    }
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
          Preview Allocation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Allocation Preview</DialogTitle>
          <DialogDescription className="text-sm">
            Review how articles are allocated before submitting
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full">
            <TabsTrigger value="preview" className="flex-1 cursor-pointer">Preview</TabsTrigger>
            <TabsTrigger value="edit" className="flex-1 cursor-pointer">Edit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="flex-1 overflow-hidden min-h-0 mt-4">
            <div className="h-full max-h-[60vh] overflow-y-auto overflow-x-auto rounded-md border bg-background/40">
              <div className="min-w-full pb-4">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Article</TableHead>
                      <TableHead className="text-right">Pages</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayArticles.map((item, index) => {
                      const isManuallyAdded = manuallyAddedArticleIds.has(item.articleId)
                      return (
                        <TableRow
                          key={`${item.name}-${item.articleId}-${index}`}
                          className={isManuallyAdded ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}
                        >
                          <TableCell>{item.month || "—"}</TableCell>
                          <TableCell>{item.date || "—"}</TableCell>
                          <TableCell className="font-medium">
                            {item.name || "—"}
                          </TableCell>
                          <TableCell className="max-w-[200px] sm:max-w-none whitespace-normal">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{item.articleId}</span>
                              {isManuallyAdded && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium shrink-0">
                                  Manual
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.pages}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex flex-col gap-4 flex-1 min-h-0">
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <Label htmlFor="pasted-allocation">Paste Article Data</Label>
                <Textarea
                  ref={textareaRef}
                  id="pasted-allocation"
                  placeholder="Paste article IDs and pages:&#10;CDC101217 [24]&#10;EA147928 [29]&#10;ABC123456&#10;&#10;Or just article IDs:&#10;CDC101217&#10;EA147928"
                  value={pastedText}
                  onChange={(e) => {
                    setPastedText(e.target.value)
                    setEditMessage(null)
                  }}
                  className="min-h-[200px] font-mono text-sm resize-none overflow-y-auto"
                  style={{
                    minHeight: "200px",
                    maxHeight: "400px",
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Paste article IDs in format: "ARTICLE_ID [PAGES]" or just "ARTICLE_ID". Articles will be distributed proportionally to team members.
                </p>
              </div>
              
              {editMessage && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    editMessage.type === "success"
                      ? "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {editMessage.text}
                </div>
              )}

              <Button
                onClick={handleApply}
                disabled={!pastedText.trim() || !onUpdateFromPastedData}
                className="w-full cursor-pointer"
              >
                Apply Allocation
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

