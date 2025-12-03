/**
 * Form Submit Button Component
 * 
 * Renders the submit button for the Article Allocation Form.
 * Disabled when allocation is invalid (over-allocated or validation errors).
 * 
 * @module components/file-allocator/form-submit-button
 */

import { Field } from "@/components/ui/field"
import { Button } from "@/components/ui/button"

interface FormSubmitButtonProps {
  isDisabled: boolean
}

/**
 * Renders the form submit button.
 * 
 * @param props - Component props
 * @param props.isDisabled - Whether the button should be disabled
 */
export function FormSubmitButton({ isDisabled }: FormSubmitButtonProps) {
  return (
    <Field>
      <Button
        type="submit"
        className="w-full h-11 text-base font-semibold"
        disabled={isDisabled}
      >
        Allocate Articles
      </Button>
    </Field>
  )
}

