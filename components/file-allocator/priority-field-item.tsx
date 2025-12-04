/**
 * Priority Field Item Component
 * 
 * Renders a single draggable priority field with:
 * - Drag handle and order indicator
 * - Person name
 * - Article count input
 * 
 * @module components/file-allocator/priority-field-item
 */

import { GripVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Controller, type Control } from "react-hook-form"
import { type FormValues } from "@/hooks/use-file-allocator-form-state"
import { cn } from "@/lib/utils"

interface PriorityFieldItemProps {
  field: { id: string; label: string }
  index: number
  control: Control<FormValues>
  isDragging: boolean
  isDragOver: boolean
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: () => void
}

/**
 * Renders a single draggable priority field item.
 * 
 * @param props - Component props
 * @param props.field - Field data (id and label)
 * @param props.index - Field index in the array
 * @param props.control - React Hook Form control
 * @param props.isDragging - Whether this item is being dragged
 * @param props.isDragOver - Whether this item is the drag target
 * @param props.onDragStart - Handler for drag start
 * @param props.onDragOver - Handler for drag over
 * @param props.onDragLeave - Handler for drag leave
 * @param props.onDrop - Handler for drop
 */
export function PriorityFieldItem({
  field,
  index,
  control,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: PriorityFieldItemProps) {
  return (
    <div
      key={field.id}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border bg-background transition-all",
        isDragging && "opacity-50 border-primary shadow-lg scale-95 cursor-grabbing",
        isDragOver && "border-primary border-2 bg-primary/10 shadow-md",
        !isDragging && !isDragOver && "cursor-grab hover:border-primary/30 hover:shadow-md"
      )}
    >
      {/* Mobile: Priority Count + Name on first row */}
      {/* Desktop: Grip + Priority Count + Name on same row */}
      <div className="flex items-center gap-2 sm:gap-2 w-full sm:w-auto">
        <GripVertical
          className={cn(
            "h-5 w-5 transition-colors shrink-0",
            isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
          )}
        />
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
          {index + 1}
        </div>
        <span className="flex-1 sm:flex-none text-sm font-medium">
          {field.label}
        </span>
      </div>
      
      {/* Mobile: Input on second row */}
      {/* Desktop: Input on same row */}
      <div className="w-full sm:w-32 space-y-1">
        <Label
          htmlFor={`priority-${field.id}`}
          className="text-xs text-muted-foreground block sm:hidden"
        >
          Article Count
        </Label>
        <Controller
          name={`priorityFields.${index}.value`}
          control={control}
          rules={{ min: 0 }}
          render={({ field: { onChange, value, ...controllerField } }) => (
            <Input
              {...controllerField}
              id={`priority-${field.id}`}
              type="number"
              value={value ?? ""}
              onChange={(e) => {
                const numValue = Number(e.target.value) || 0
                onChange(numValue, { shouldDirty: true, shouldValidate: true })
              }}
              min="0"
              className="w-full"
              placeholder="0"
            />
          )}
        />
      </div>
    </div>
  )
}

