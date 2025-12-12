/**
 * Priority Fields List Component
 * 
 * Renders a list of draggable priority fields with:
 * - Header showing allocation order label and remaining articles count
 * - Drag-and-drop enabled priority field items
 * 
 * @module components/file-allocator/priority-fields-list
 */

import { Field, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/common/utils"
import { PriorityFieldItem } from "./priority-field-item"
import { type Control } from "react-hook-form"
import { type FormValues } from "@/types/file-allocator"
import { type FieldArrayWithId } from "react-hook-form"

interface PriorityFieldsListProps {
  fields: FieldArrayWithId<FormValues, "priorityFields", "id">[]
  control: Control<FormValues>
  totalArticles: number
  remainingArticles: number
  draggedIndex: number | null
  dragOverIndex: number | null
  isLoadingMembers: boolean
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragLeave: () => void
  onDrop: (index: number) => void
}

/**
 * Renders the priority fields list with drag-and-drop functionality.
 * 
 * @param props - Component props
 * @param props.fields - Array of priority fields from react-hook-form
 * @param props.control - React Hook Form control
 * @param props.totalArticles - Total number of articles available
 * @param props.remainingArticles - Number of articles remaining to allocate
 * @param props.draggedIndex - Index of the field being dragged
 * @param props.dragOverIndex - Index of the field being dragged over
 * @param props.onDragStart - Handler for drag start
 * @param props.onDragOver - Handler for drag over
 * @param props.onDragLeave - Handler for drag leave
 * @param props.onDrop - Handler for drop
 */
export function PriorityFieldsList({
  fields,
  control,
  totalArticles,
  remainingArticles,
  draggedIndex,
  dragOverIndex,
  isLoadingMembers,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: PriorityFieldsListProps) {
  return (
    <Field>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <FieldLabel>Allocation Order</FieldLabel>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drag people to reorder priority
            </p>
          </div>
          {totalArticles > 0 && (
            <span
              className={cn(
                "text-sm font-medium",
                remainingArticles === 0
                  ? "text-green-600"
                  : remainingArticles < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
              )}
            >
              {remainingArticles === 0
                ? "All allocated"
                : `${remainingArticles} article${remainingArticles === 1 ? "" : "s"} remaining`}
            </span>
          )}
        </div>
        {isLoadingMembers ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-9 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <PriorityFieldItem
                key={field.id}
                field={field}
                index={index}
                control={control}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragLeave={onDragLeave}
                onDrop={() => onDrop(index)}
              />
            ))}
          </div>
        )}
      </div>
    </Field>
  )
}

