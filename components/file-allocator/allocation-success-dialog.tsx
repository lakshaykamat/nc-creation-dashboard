/**
 * Allocation Success Dialog Component
 * 
 * Displays a success message with a checkmark icon after successful allocation submission.
 * Automatically redirects to home page after a short delay.
 * 
 * @module components/file-allocator/allocation-success-dialog
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
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
  const router = useRouter()
  const { copy, copied } = useCopyAllocation(allocation)

  useEffect(() => {
    if (open) {
      // Redirect to home page after 2 seconds
      const timer = setTimeout(() => {
        router.push("/")
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [open, router])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" showCloseButton={false}>
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
              onClick={copy}
              variant="outline"
              className="mt-4"
              disabled={copied}
            >
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Copy Allocation Info"}
            </Button>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting to home page...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

