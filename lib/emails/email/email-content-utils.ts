/**
 * Email Content Utility Functions
 * 
 * Pure utility functions for extracting email content
 * 
 * @module lib/emails/email-content-utils
 */

import type { Email } from "@/types/emails"

/**
 * Get email preview text
 * 
 * @param email - Email object
 * @returns Preview text or fallback message
 */
export function getEmailPreview(email: Email): string {
  return email.text || email.textAsHtml || "No preview available"
}

/**
 * Get email HTML content (prioritizes html, then textAsHtml, then text)
 * 
 * @param email - Email object
 * @returns HTML content string
 */
export function getEmailHtmlContent(email: Email): string {
  return email.html || email.textAsHtml || email.text || ""
}

