/**
 * Allocation Success Dialog Component
 * 
 * Displays a success message with a checkmark icon after successful allocation submission.
 * 
 * @module components/file-allocator/allocation-success-dialog
 */

"use client"

import { useEffect, useRef } from "react"
import { CheckCircle2, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  VisuallyHidden,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { FinalAllocationResult } from "@/hooks/file-allocator/use-file-allocator-form-state"
import { useCopyAllocation } from "@/hooks/file-allocator/use-copy-allocation"

interface AllocationSuccessDialogProps {
  open: boolean
  itemCount: number
  allocation?: FinalAllocationResult
}

/**
 * Renders a success dialog with checkmark icon.
 * 
 * @param props - Component props
 * @param props.open - Whether the dialog is open
 * @param props.itemCount - Number of items allocated
 * @param props.allocation - Allocation data to copy
 */
export function AllocationSuccessDialog({
  open,
  itemCount,
  allocation,
}: AllocationSuccessDialogProps) {
  const { copy, copied } = useCopyAllocation(allocation)
  const hasAutoCopied = useRef(false)

  useEffect(() => {
    if (open && allocation && !hasAutoCopied.current) {
      // Auto-copy allocation info when dialog opens (only once)
      // Add a longer delay to ensure dialog animation completes and document is ready
      const copyTimer = setTimeout(async () => {
        try {
          await copy()
          hasAutoCopied.current = true
        } catch (err) {
          // If auto-copy fails, user can still click the button
          console.warn("Auto-copy failed, user can manually copy:", err)
        }
      }, 300)

      return () => {
        clearTimeout(copyTimer)
      }
    }
    
    // Reset the ref when dialog closes
    if (!open) {
      hasAutoCopied.current = false
    }
  }, [open, allocation, copy])

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    await copy()
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" showCloseButton={true}>
        <VisuallyHidden>
          <DialogTitle>Allocation Successful</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-foreground">
            Allocation Successful!
          </h3>
          <p className="text-center text-muted-foreground">
            {itemCount} article{itemCount !== 1 ? "s" : ""} allocated successfully.
          </p>
          {allocation && (
            <Button
              onClick={handleCopy}
              variant="outline"
              className="mt-4"
              disabled={copied}
              type="button"
            >
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Copy Allocation Info"}
            </Button>
          )}
          {allocation && copied && (
            <p className="mt-2 text-sm text-muted-foreground">
              Allocation info copied to clipboard!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

