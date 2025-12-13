/**
 * Generic Analytics Logger Utility
 * 
 * Reusable utility for logging analytics data to MongoDB "logs" collection
 * Can be used across different domains and log types
 * 
 * @module lib/db/analytics-logger
 */

import { getNCCollection } from "@/lib/db/nc-database"
import type { UserDeviceInfo } from "@/lib/utils/request-utils"

/**
 * Base analytics log structure
 */
export interface BaseAnalyticsLog {
  domain: string
  timestamp: Date
  urlPath: string
  userDetails?: UserDeviceInfo
  [key: string]: unknown // Allow additional fields
}

/**
 * Log analytics data to MongoDB
 * 
 * @param domain - The domain/feature name (e.g., "article allocator", "email processing")
 * @param urlPath - The URL path where the action occurred
 * @param data - Additional data to log (will be merged into the log entry)
 * @param userDetails - Optional user device and browser information
 * @returns Promise that resolves when log is saved
 * 
 * @example
 * ```ts
 * // Simple log
 * await logAnalytics("article allocator", "/api/allocations", { action: "submit" })
 * 
 * // Complex log with form data and user details
 * await logAnalytics(
 *   "article allocator",
 *   "/api/allocations",
 *   {
 *     formData: allocationData,
 *     summary: { totalArticles: 10, totalPages: 200 }
 *   },
 *   userDetails
 * )
 * ```
 */
export async function logAnalytics(
  domain: string,
  urlPath: string,
  data: Record<string, unknown> = {},
  userDetails?: UserDeviceInfo
): Promise<void> {
  try {
    const collection = await getNCCollection<BaseAnalyticsLog>("logs")

    const now = new Date()

    const logEntry: BaseAnalyticsLog = {
      domain,
      timestamp: now,
      urlPath,
      ...(userDetails && { userDetails }), // Include user details if provided
      ...data, // Merge additional data
    }

    await collection.insertOne(logEntry)
  } catch (error) {
    // Log error but don't throw - we don't want to fail the operation if logging fails
    console.error(`Failed to log analytics for domain "${domain}":`, error)
  }
}

