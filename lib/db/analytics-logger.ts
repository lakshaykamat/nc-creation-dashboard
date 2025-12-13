/**
 * Generic Analytics Logger Utility
 * 
 * Reusable utility for logging analytics data to MongoDB "logs" collection
 * Can be used across different domains and log types
 * 
 * @module lib/db/analytics-logger
 */

import clientPromise from "@/lib/db/mongo"

/**
 * Base analytics log structure
 */
export interface BaseAnalyticsLog {
  domain: string
  timestamp: Date
  date: string
  time: string
  urlPath: string
  [key: string]: unknown // Allow additional fields
}

/**
 * Format date and time strings
 */
function formatDateTime(date: Date): { date: string; time: string } {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}:${seconds}`,
  }
}

/**
 * Log analytics data to MongoDB
 * 
 * @param domain - The domain/feature name (e.g., "article allocator", "email processing")
 * @param urlPath - The URL path where the action occurred
 * @param data - Additional data to log (will be merged into the log entry)
 * @returns Promise that resolves when log is saved
 * 
 * @example
 * ```ts
 * // Simple log
 * await logAnalytics("article allocator", "/api/allocations", { action: "submit" })
 * 
 * // Complex log with form data
 * await logAnalytics(
 *   "article allocator",
 *   "/api/allocations",
 *   {
 *     formData: allocationData,
 *     summary: { totalArticles: 10, totalPages: 200 }
 *   }
 * )
 * ```
 */
export async function logAnalytics(
  domain: string,
  urlPath: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  try {
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection<BaseAnalyticsLog>("logs")

    const now = new Date()
    const { date, time } = formatDateTime(now)

    const logEntry: BaseAnalyticsLog = {
      domain,
      timestamp: now,
      date,
      time,
      urlPath,
      ...data, // Merge additional data
    }

    await collection.insertOne(logEntry)
  } catch (error) {
    // Log error but don't throw - we don't want to fail the operation if logging fails
    console.error(`Failed to log analytics for domain "${domain}":`, error)
  }
}

