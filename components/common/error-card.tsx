"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorCardProps {
  error?: unknown
  onRetry?: () => void
  retryLabel?: string
  title?: string
}

export function ErrorCard({
  error,
  onRetry,
  retryLabel = "Try Again",
  title = "Unable to load data",
}: ErrorCardProps) {
  const errorObj = error as unknown as Record<string, unknown>
  const errorCode =
    typeof errorObj?.code === "number" ? errorObj.code : undefined
  const errorMessage =
    typeof errorObj?.message === "string" ? errorObj.message : undefined

  // Sanitize error message to avoid exposing business logic
  const getDisplayMessage = (): string => {
    if (!errorMessage) {
      return "Something went wrong. Please try again later."
    }

    // Generic messages that don't expose business logic
    const lowerMessage = errorMessage.toLowerCase()

    if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
      return "Network error. Please check your connection and try again."
    }

    if (lowerMessage.includes("timeout")) {
      return "Request timed out. Please try again."
    }

    if (lowerMessage.includes("unauthorized") || lowerMessage.includes("403")) {
      return "You don't have permission to access this resource."
    }

    if (lowerMessage.includes("not found") || lowerMessage.includes("404")) {
      return "The requested resource was not found."
    }

    if (
      lowerMessage.includes("server") ||
      lowerMessage.includes("500") ||
      lowerMessage.includes("502") ||
      lowerMessage.includes("503")
    ) {
      return "Server error. Please try again later."
    }

    // For other errors, show a generic message
    return "An unexpected error occurred. Please try again."
  }

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 shrink-0 mt-0.5">
          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-destructive">
            {errorCode && <span className="mr-2">{errorCode}</span>}
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5">
            {getDisplayMessage()}
          </p>
          {onRetry && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                {retryLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

