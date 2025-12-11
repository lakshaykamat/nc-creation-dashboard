/**
 * Email Recipient Utility Functions
 * 
 * Pure utility functions for extracting recipient information from emails
 * 
 * @module lib/emails/email-recipient-utils
 */

import type { Email } from "@/types/emails"

/**
 * Get recipient addresses as formatted string
 * 
 * @param email - Email object
 * @returns Comma-separated string of recipient names or addresses
 */
export function getEmailRecipients(email: Email): string {
  return email.to.value.map((addr) => addr.name || addr.address).join(", ")
}

