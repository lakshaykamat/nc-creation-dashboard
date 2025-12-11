/**
 * Email Sender Utility Functions
 * 
 * Pure utility functions for extracting sender information from emails
 * 
 * @module lib/emails/email-sender-utils
 */

import type { Email } from "@/types/emails"

/**
 * Get sender name from email
 * 
 * @param email - Email object
 * @returns Sender name or address or "Unknown"
 */
export function getEmailSenderName(email: Email): string {
  return email.from.value[0]?.name || email.from.value[0]?.address || "Unknown"
}

/**
 * Get sender address from email
 * 
 * @param email - Email object
 * @returns Sender email address
 */
export function getEmailSenderAddress(email: Email): string {
  return email.from.value[0]?.address || ""
}

