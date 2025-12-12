/**
 * Allocation Preview Dialog Component
 * 
 * Displays a dialog with the allocation preview table.
 * The table shows allocated and unallocated articles with scrollable content.
 * 
 * @module components/file-allocator/allocation-preview-dialog
 */

"use client"

import { useState } from "react"
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
import { type AllocatedArticle } from "@/types/file-allocator"

interface AllocationPreviewDialogProps {
  displayArticles: AllocatedArticle[]
  disabled?: boolean
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
}: AllocationPreviewDialogProps) {
  const [open, setOpen] = useState(false)

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
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full max-h-[60vh] overflow-y-auto overflow-x-auto rounded-md border bg-background/40">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead className="text-right">Pages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayArticles.map((item, index) => (
                  <TableRow
                    key={`${item.name}-${item.articleId}-${index}`}
                  >
                    <TableCell>{item.month || "—"}</TableCell>
                    <TableCell>{item.date || "—"}</TableCell>
                    <TableCell className="font-medium">
                      {item.name || "—"}
                    </TableCell>
                    <TableCell>{item.articleId}</TableCell>
                    <TableCell className="text-right">
                      {item.pages}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

