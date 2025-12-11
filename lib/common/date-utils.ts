/**
 * Date Utility Functions
 * 
 * Pure utility functions for date formatting
 * 
 * @module lib/file-allocator/date-utils
 */

/**
 * Get current month name and formatted date
 * 
 * @returns Object with month name and date string in DD/MM/YYYY format
 */
export function getCurrentMonthAndDate(): { month: string; date: string } {
  const now = new Date()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const month = monthNames[now.getMonth()]
  const day = String(now.getDate()).padStart(2, "0")
  const monthNum = String(now.getMonth() + 1).padStart(2, "0")
  const year = now.getFullYear()
  const date = `${day}/${monthNum}/${year}`
  return { month, date }
}

