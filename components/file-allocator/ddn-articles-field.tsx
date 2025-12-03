/**
 * DDN Articles Field Component
 * 
 * Renders a textarea for entering DDN (Direct Data Network) article IDs.
 * Validates that articles are unique and exist in the available articles list.
 * 
 * @module components/file-allocator/ddn-articles-field
 */

import { Field, FieldLabel } from "@/components/ui/field"
import { type UseFormRegister } from "react-hook-form"
import { type FormValues } from "@/hooks/use-file-allocator-form-state"

interface DdnArticlesFieldProps {
  register: UseFormRegister<FormValues>
  validationError: string | null
}

/**
 * Renders the DDN articles textarea field with validation error display.
 * 
 * @param props - Component props
 * @param props.register - React Hook Form register function
 * @param props.validationError - Validation error message (if any)
 */
export function DdnArticlesField({
  register,
  validationError,
}: DdnArticlesFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor="ddn-articles">
        DDN Articles
      </FieldLabel>
      <textarea
        id="ddn-articles"
        {...register("ddnArticles")}
        rows={6}
        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        placeholder="Enter one DDN article per line"
      />
      {validationError && (
        <p className="mt-1 text-xs text-destructive">
          {validationError}
        </p>
      )}
    </Field>
  )
}

