/**
 * Form Submit Button with Alert Dialog Component
 * 
 * Renders the submit button wrapped in an AlertDialog for confirmation.
 * Disabled when allocation is invalid (over-allocated or validation errors).
 * 
 * @module components/file-allocator/form-submit-button-with-dialog
 */

"use client"

import { Field } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FormSubmitButtonWithDialogProps {
  isDisabled: boolean
  onSubmit: (e?: React.FormEvent) => void
}

/**
 * Renders the form submit button with confirmation dialog.
 * 
 * @param props - Component props
 * @param props.isDisabled - Whether the button should be disabled
 * @param props.onSubmit - Function to call when confirmed (form submit handler)
 */
export function FormSubmitButtonWithDialog({
  isDisabled,
  onSubmit,
}: FormSubmitButtonWithDialogProps) {
  const handleConfirm = () => {
    // Create a synthetic form event to pass to onSubmit
    onSubmit()
  }

  return (
    <Field>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            className="w-full h-11 text-base font-semibold"
            disabled={isDisabled}
          >
            Allocate Articles
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Allocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this allocation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm Allocation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Field>
  )
}

