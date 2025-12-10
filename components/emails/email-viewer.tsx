/**
 * Email Viewer Component
 * 
 * Displays email HTML content in the right panel
 * 
 * @module components/emails/email-viewer
 */

"use client"

import { useMemo } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Email } from "@/types/emails"

interface EmailViewerProps {
  email: Email | null
  onBack?: () => void
}

export function EmailViewer({ email, onBack }: EmailViewerProps) {
  const iframeContent = useMemo(() => {
    if (!email) return ""
    
    const htmlContent = email.html || email.textAsHtml || email.text || ""
    return htmlContent
  }, [email])

  const iframeSrcDoc = useMemo(() => {
    if (!iframeContent) return ""
    
    return `
      <!DOCTYPE html>
      <html style="height: 100%; overflow: hidden;">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            html, body {
              height: 100%;
              margin: 0;
              padding: 16px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              overflow-y: auto;
              overflow-x: hidden;
            }
          </style>
        </head>
        <body>
          ${iframeContent}
        </body>
      </html>
    `
  }, [iframeContent])

  if (!email) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">Select an email to view</p>
          <p className="text-sm mt-2">Choose an email from the list to see its content</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`

      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      }).format(date)
    } catch {
      return dateString
    }
  }

  const getFromName = (email: Email) => {
    return email.from.value[0]?.name || email.from.value[0]?.address || "Unknown"
  }

  const getFromAddress = (email: Email) => {
    return email.from.value[0]?.address || ""
  }

  const getToAddresses = (email: Email) => {
    return email.to.value.map((addr) => addr.name || addr.address).join(", ")
  }

  const fromName = getFromName(email)
  const fromAddress = getFromAddress(email)
  const toAddresses = getToAddresses(email)

  return (
    <div className="h-full flex flex-col">
      <div className="border-b pb-4 shrink-0">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-3 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div className="space-y-2">
          <div className="font-semibold text-lg">{email.subject}</div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{fromName}</span>
            {fromAddress && fromName !== fromAddress && (
              <span className="text-muted-foreground/70"> &lt;{fromAddress}&gt;</span>
            )}
            {toAddresses && (
              <>
                <span className="mx-2">→</span>
                <span>{toAddresses}</span>
              </>
            )}
            <span className="ml-2">• {formatDate(email.date)}</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden min-h-0">
        <iframe
          srcDoc={iframeSrcDoc}
          className="w-full h-full border-0 block"
          title="Email content"
          sandbox="allow-same-origin"
          scrolling="yes"
        />
      </div>
    </div>
  )
}

