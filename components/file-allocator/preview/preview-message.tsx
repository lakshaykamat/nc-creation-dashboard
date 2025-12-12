/**
 * Message Display Component
 * 
 * Displays success or error messages in the preview dialog.
 * 
 * @module components/file-allocator/preview-message
 */

"use client"

interface PreviewMessageProps {
  message: { type: "success" | "error"; text: string } | null
  className?: string
}

export function PreviewMessage({ message, className = "" }: PreviewMessageProps) {
  if (!message) return null

  return (
    <div
      className={`p-2 rounded-md text-sm ${
        message.type === "success"
          ? "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800"
      } ${className}`}
    >
      {message.text}
    </div>
  )
}

