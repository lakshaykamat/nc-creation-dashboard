/**
 * Email Viewer Component
 * 
 * Displays email HTML content in the right panel
 * 
 * @module components/emails/email-viewer
 */

"use client"

import { EmailViewerHeader } from "./email-viewer-header"
import { EmailIframe } from "./email-iframe"
import { useIsMobile } from "@/hooks/common/use-mobile"
import type { EmailViewerProps } from "@/types/emails"

export function EmailViewer({ email, onBack }: EmailViewerProps) {
  const isMobile = useIsMobile()

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

  // Mobile: full screen with fixed positioning, accounting for page header
  // PageHeader is ~2.5rem tall + mb-6 (1.5rem) = ~4rem total
  // Desktop: full height container with scrollable iframe
  const containerClasses = isMobile && onBack
    ? "h-[calc(100vh-4rem)] w-screen flex flex-col fixed top-16 left-0 right-0 bg-background z-50"
    : "h-full flex flex-col min-h-0"

  return (
    <div className={containerClasses}>
      <EmailViewerHeader email={email} onBack={onBack} isMobile={isMobile} />
      <EmailIframe email={email} />
    </div>
  )
}

