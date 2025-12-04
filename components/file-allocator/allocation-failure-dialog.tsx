/**
 * Allocation Failure Dialog Component
 * 
 * Displays an error message with an X icon after failed allocation submission.
 * Automatically redirects to file-allocator page after a short delay.
 * 
 * @module components/file-allocator/allocation-failure-dialog
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

interface AllocationFailureDialogProps {
  open: boolean
  errorMessage?: string
}

/**
 * Renders a failure dialog with error icon.
 * 
 * @param props - Component props
 * @param props.open - Whether the dialog is open
 * @param props.errorMessage - Optional error message to display
 */
export function AllocationFailureDialog({
  open,
  errorMessage,
}: AllocationFailureDialogProps) {
  const router = useRouter()

  useEffect(() => {
    if (open) {
      // Redirect to file-allocator page after 2 seconds
      const timer = setTimeout(() => {
        router.push("/file-allocator")
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [open, router])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/20">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-foreground">
            Allocation Failed
          </h3>
          <p className="text-center text-muted-foreground">
            {errorMessage || "Failed to submit allocation. Please try again."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting to file allocator...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

