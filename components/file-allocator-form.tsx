"use client"

import { useState } from "react"
import { GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PriorityField {
  id: string
  label: string
  value: number
}

export function FileAllocatorForm() {
  const [dropdownValue, setDropdownValue] = useState("")
  const [priorityFields, setPriorityFields] = useState<PriorityField[]>([
    { id: "1", label: "Ruchi", value: 0 },
    { id: "2", label: "Karishma", value: 0 },
  ])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [textareaValue, setTextareaValue] = useState("")

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newFields = [...priorityFields]
    const draggedItem = newFields[draggedIndex]
    newFields.splice(draggedIndex, 1)
    newFields.splice(dropIndex, 0, draggedItem)
    setPriorityFields(newFields)
    setDraggedIndex(null)
  }

  const handlePriorityChange = (id: string, value: number) => {
    setPriorityFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, value } : field))
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: Implement form submission
    console.log({
      dropdown: dropdownValue,
      priorities: priorityFields,
      textarea: textareaValue,
    })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>File Allocation Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="allocation-method">Allocation method</FieldLabel>
              <select
                id="allocation-method"
                value={dropdownValue}
                onChange={(e) => setDropdownValue(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select allocation method...</option>
                <option value="allocate by pages">allocate by pages</option>
                <option value="allocate by priority">allocate by priority</option>
              </select>
            </Field>

            <Field>
              <FieldLabel>Priority Fields (Drag to reorder)</FieldLabel>
              <div className="space-y-2">
                {priorityFields.map((field, index) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md border bg-card cursor-move transition-colors",
                      draggedIndex === index && "opacity-50 border-primary",
                      "hover:bg-accent/50"
                    )}
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                    <Label htmlFor={`priority-${field.id}`} className="w-24 shrink-0">
                      {field.label}
                    </Label>
                    <Input
                      id={`priority-${field.id}`}
                      type="number"
                      value={field.value}
                      onChange={(e) =>
                        handlePriorityChange(field.id, Number(e.target.value))
                      }
                      min="0"
                      className="flex-1"
                      placeholder="file count to allocate"
                    />
                  </div>
                ))}
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="textarea">DDN Allocated Article</FieldLabel>
              <textarea
                id="textarea"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                rows={6}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Enter DDN allocated article..."
              />
            </Field>

            <Field>
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
    </div>
  )
}

