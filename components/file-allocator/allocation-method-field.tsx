/**
 * Allocation Method Field Component
 * 
 * Renders a dropdown select for choosing the allocation method:
 * - "Allocate by Pages": Allocates the N largest articles (by page count)
 * - "Allocate by Priority": Allocates articles in priority order
 * 
 * @module components/file-allocator/allocation-method-field
 */

import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ALLOCATION_METHOD_OPTIONS } from "@/lib/constants/file-allocator-constants"
import { Controller, type Control } from "react-hook-form"
import { type FormValues } from "@/types/file-allocator"

interface AllocationMethodFieldProps {
  control: Control<FormValues>
}

/**
 * Renders the allocation method dropdown field using shadcn Select.
 * 
 * @param props - Component props
 * @param props.control - React Hook Form control
 */
export function AllocationMethodField({ control }: AllocationMethodFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor="allocation-method">
        Allocation Method
      </FieldLabel>
      <Controller
        name="allocationMethod"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger id="allocation-method" className="w-full">
              <SelectValue placeholder="Select allocation method..." />
            </SelectTrigger>
            <SelectContent>
              {ALLOCATION_METHOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  )
}

