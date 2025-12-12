/**
 * Hook for managing preview dialog state and interactions
 * 
 * Handles:
 * - Editing cell state
 * - Paste operations
 * - Message display with auto-dismiss
 * - Textarea auto-resize
 * 
 * @module hooks/file-allocator/use-preview-dialog-state
 */

import { useState, useRef, useEffect, useCallback } from "react"
import type { AllocatedArticle } from "@/types/file-allocator"

const MESSAGE_DISMISS_DELAY = 2000 // 2 seconds

interface UsePreviewDialogStateProps {
  onUpdateFromPastedData?: (text: string) => { success: boolean; message: string }
}

export function usePreviewDialogState({ onUpdateFromPastedData }: UsePreviewDialogStateProps = {}) {
  const [pastedText, setPastedText] = useState("")
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [editingCell, setEditingCell] = useState<{ articleId: string; field: keyof AllocatedArticle } | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const newHeight = Math.min(textarea.scrollHeight, 400)
      textarea.style.height = `${newHeight}px`
    }
  }, [])

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  // Handle cell click to start editing
  const handleCellClick = useCallback((articleId: string, field: keyof AllocatedArticle, currentValue: string | number) => {
    setEditingCell({ articleId, field })
    setEditValue(String(currentValue))
  }, [])

  // Handle saving edited value
  const handleSaveEdit = useCallback(() => {
    if (!editingCell) return false
    setEditingCell(null)
    setEditValue("")
    return true
  }, [editingCell])

  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setEditingCell(null)
    setEditValue("")
  }, [])

  // Show message with auto-dismiss
  const showMessage = useCallback((type: "success" | "error", text: string, autoDismiss = true) => {
    setEditMessage({ type, text })
    if (autoDismiss && type === "success") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setEditMessage(null)
      }, MESSAGE_DISMISS_DELAY)
    }
  }, [])

  // Handle paste event on table
  const handleTablePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (!onUpdateFromPastedData) return

      e.preventDefault()
      const pastedData = e.clipboardData.getData("text")
      
      if (pastedData.trim()) {
        const result = onUpdateFromPastedData(pastedData)
        showMessage(result.success ? "success" : "error", result.message, result.success)
      }
    },
    [onUpdateFromPastedData, showMessage]
  )

  // Handle apply button click
  const handleApply = useCallback(() => {
    if (!onUpdateFromPastedData) {
      showMessage("error", "Update function not available", false)
      return
    }

    if (!pastedText.trim()) {
      showMessage("error", "Please paste allocation data", false)
      return
    }

    const result = onUpdateFromPastedData(pastedText)
    showMessage(result.success ? "success" : "error", result.message, result.success)

    if (result.success) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setPastedText("")
        setEditMessage(null)
      }, MESSAGE_DISMISS_DELAY)
    }
  }, [pastedText, onUpdateFromPastedData, showMessage])

  // Clear message
  const clearMessage = useCallback(() => {
    setEditMessage(null)
  }, [])

  return {
    // State
    pastedText,
    setPastedText,
    editMessage,
    editingCell,
    editValue,
    setEditValue,
    
    // Refs
    textareaRef,
    inputRef,
    
    // Handlers
    handleCellClick,
    handleSaveEdit,
    handleCancelEdit,
    handleTablePaste,
    handleApply,
    clearMessage,
    adjustTextareaHeight,
  }
}

