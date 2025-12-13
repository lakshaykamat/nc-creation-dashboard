/**
 * MongoDB Indexes for Analytics Collections
 * 
 * Ensures optimal indexes are created for analytics queries
 * 
 * @module lib/db/analytics-indexes
 */

import { getNCCollection } from "./nc-database"

/**
 * Ensures indexes are created on the logs collection for optimal query performance
 * 
 * Should be called once at application startup or when needed
 */
export async function ensureAnalyticsIndexes(): Promise<void> {
  try {
    const collection = await getNCCollection("logs")

    // Create compound index on (domain, timestamp) for optimized filtering and sorting
    // This index is optimal for:
    // 1. Filtering by domain (page view, article allocator)
    // 2. Sorting by timestamp
    // 3. Aggregation pipelines that group by date extracted from timestamp
    await collection.createIndex(
      { domain: 1, timestamp: 1 },
      { 
        name: "domain_timestamp_idx",
        background: true, // Create index in background to avoid blocking
      }
    )

    // Create index on timestamp alone for date-based queries
    await collection.createIndex(
      { timestamp: 1 },
      { 
        name: "timestamp_idx",
        background: true,
      }
    )

    // Create index on domain alone for domain-based queries
    await collection.createIndex(
      { domain: 1 },
      { 
        name: "domain_idx",
        background: true,
      }
    )
  } catch (error) {
    // Log error but don't throw - indexes may already exist
    console.error("Error creating analytics indexes:", error)
  }
}

