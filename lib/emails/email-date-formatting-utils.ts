/**
 * Email Date Formatting Utility Functions
 * 
 * Pure utility functions for formatting email dates
 * 
 * @module lib/emails/email-date-formatting-utils
 */

/**
 * Format email date to readable string
 * 
 * @param dateString - ISO date string
 * @returns Formatted date string
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
 * Format email date to relative time (e.g., "2h ago", "3d ago")
 * 
 * @param dateString - ISO date string
 * @returns Relative time string
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

