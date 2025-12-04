/**
 * Allocation Loading Dialog Component
 * 
 * Displays a loading spinner while the allocation is being submitted.
 * 
 * @module components/file-allocator/allocation-loading-dialog
 */

"use client"

import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

interface AllocationLoadingDialogProps {
  open: boolean
}

/**
 * Renders a loading dialog with spinner.
 * 
 * @param props - Component props
 * @param props.open - Whether the dialog is open
 */
export function AllocationLoadingDialog({
  open,
}: AllocationLoadingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">
            Submitting Allocation
          </h3>
          <p className="text-center text-muted-foreground">
            Please wait while we process your allocation...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

