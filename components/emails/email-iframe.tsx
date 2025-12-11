/**
 * Email Iframe Component
 * 
 * Iframe wrapper for displaying email HTML content
 * 
 * @module components/emails/email-iframe
 */

"use client"

import { useMemo } from "react"
import { getEmailHtmlContent } from "@/lib/emails/email-utils"
import type { Email } from "@/types/emails"

interface EmailIframeProps {
  email: Email
}

export function EmailIframe({ email }: EmailIframeProps) {
  const iframeContent = useMemo(() => {
    if (!email) return ""
    return getEmailHtmlContent(email)
  }, [email])

  const iframeSrcDoc = useMemo(() => {
    if (!iframeContent) return ""
    
    return `
      <!DOCTYPE html>
      <html style="height: 100%; overflow: hidden;">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
          <style>
            * {
              box-sizing: border-box;
            }
            html, body {
              height: 100%;
              margin: 0;
              padding: 12px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              overflow-y: auto;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              word-wrap: break-word;
            }
            body {
              min-height: 100%;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            table {
              width: 100%;
              max-width: 100%;
              table-layout: auto;
            }
            /* Allow horizontal scrolling for wide content */
            pre, code {
              overflow-x: auto;
              word-wrap: normal;
              white-space: pre;
            }
            /* Ensure wide elements can scroll */
            .email-content {
              min-width: fit-content;
            }
          </style>
        </head>
        <body>
          ${iframeContent}
        </body>
      </html>
    `
  }, [iframeContent])

  return (
    <div className="flex-1 overflow-auto min-h-0 w-full">
      <iframe
        srcDoc={iframeSrcDoc}
        className="w-full h-full border-0 block min-w-full"
        title="Email content"
        sandbox="allow-same-origin"
        scrolling="yes"
      />
    </div>
  )
}

