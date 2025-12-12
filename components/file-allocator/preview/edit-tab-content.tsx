/**
 * Edit Tab Content Component
 * 
 * Displays the edit tab with textarea for pasting article data.
 * 
 * @module components/file-allocator/edit-tab-content
 */

"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PreviewMessage } from "./preview-message"

interface EditTabContentProps {
  pastedText: string
  setPastedText: (text: string) => void
  editMessage: { type: "success" | "error"; text: string } | null
  onApply: () => void
  isDisabled?: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  adjustTextareaHeight: () => void
}

export function EditTabContent({
  pastedText,
  setPastedText,
  editMessage,
  onApply,
  isDisabled = false,
  textareaRef,
  adjustTextareaHeight,
}: EditTabContentProps) {
  useEffect(() => {
    adjustTextareaHeight()
  }, [pastedText, adjustTextareaHeight])

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="space-y-2 flex-1 flex flex-col min-h-0">
        <Label htmlFor="pasted-allocation">Paste Article Data</Label>
        <Textarea
          ref={textareaRef}
          id="pasted-allocation"
          placeholder="Paste article IDs and pages:&#10;CDC101217 [24]&#10;EA147928 [29]&#10;ABC123456&#10;&#10;Or just article IDs:&#10;CDC101217&#10;EA147928"
          value={pastedText}
          onChange={(e) => {
            setPastedText(e.target.value)
          }}
          className="min-h-[200px] font-mono text-sm resize-none overflow-y-auto"
          style={{
            minHeight: "200px",
            maxHeight: "400px",
          }}
        />
        <p className="text-xs text-muted-foreground">
          Paste article IDs in format: "ATECH1232 12"
        </p>
      </div>
      
      <PreviewMessage message={editMessage} className="p-3" />

      <Button
        onClick={onApply}
        disabled={!pastedText.trim() || isDisabled}
        className="w-full cursor-pointer"
      >
        Apply Allocation
      </Button>
    </div>
  )
}

