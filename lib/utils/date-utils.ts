/**
 * Date Utility Functions
 * 
 * Provides timezone-aware date utilities
 * 
 * @module lib/utils/date-utils
 */

import { APP_TIMEZONE } from "@/lib/constants/timezone-constants"

/**
 * Get current date in application timezone
 */
export function getCurrentDate(): Date {
  return new Date()
}

/**
 * Format date in application timezone
 * 
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateInAppTimezone(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    ...options,
  }).format(dateObj)
}

/**
 * Get date string in YYYY-MM-DD format in application timezone
 */
export function getDateString(date: Date = new Date()): string {
  return formatDateInAppTimezone(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .split("/")
    .reverse()
    .join("-")
    .replace(/\b(\d)\b/g, "0$1")
    .split("-")
    .map((part, index) => {
      if (index === 1 || index === 2) {
        return part.slice(-2) // Take last 2 digits for month and day
      }
      return part
    })
    .join("-")
}

/**
 * Get ISO string adjusted for application timezone
 * Note: Still returns ISO string (UTC), but can be formatted using formatDateInAppTimezone
 */
export function getISOString(date: Date = new Date()): string {
  return date.toISOString()
}

