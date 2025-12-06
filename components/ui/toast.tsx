"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/common/utils"

interface ToastProps {
  message: string
  type?: "error" | "success" | "info"
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = "error", duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-top-5",
        type === "error" && "border-destructive/50 bg-destructive/10 text-destructive",
        type === "success" && "border-green-500/50 bg-green-500/10 text-green-600",
        type === "info" && "border-blue-500/50 bg-blue-500/10 text-blue-600"
      )}
    >
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

