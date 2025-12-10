/**
 * Email Utility Functions
 * 
 * Pure utility functions for email formatting and data extraction
 * 
 * @module lib/emails/email-utils
 */

import type { Email } from "@/types/emails"

/**
 * Format email date to readable string
 */
export function formatEmailDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch {
    return dateString
  }
}

/**
 * Get sender name from email
 */
export function getEmailSenderName(email: Email): string {
  return email.from.value[0]?.name || email.from.value[0]?.address || "Unknown"
}

/**
 * Get email preview text
 */
export function getEmailPreview(email: Email): string {
  return email.text || email.textAsHtml || "No preview available"
}

/**
 * Get email HTML content (prioritizes html, then textAsHtml, then text)
 */
export function getEmailHtmlContent(email: Email): string {
  return email.html || email.textAsHtml || email.text || ""
}

/**
 * Format email date to relative time (e.g., "2h ago", "3d ago")
 */
export function formatEmailDateRelative(dateString: string): string {
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

/**
 * Get sender address from email
 */
export function getEmailSenderAddress(email: Email): string {
  return email.from.value[0]?.address || ""
}

/**
 * Get recipient addresses as formatted string
 */
export function getEmailRecipients(email: Email): string {
  return email.to.value.map((addr) => addr.name || addr.address).join(", ")
}

