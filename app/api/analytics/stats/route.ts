/**
 * API Route for Analytics Statistics
 * 
 * GET /api/analytics/stats
 * 
 * Returns page view counts and visitor counts
 * 
 * @module app/api/analytics/stats
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { ensureAnalyticsIndexes } from "@/lib/db/analytics-indexes"
import { getNCCollection } from "@/lib/db/nc-database"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

interface TimeSeriesDataPoint {
  date: string
  pageViews: number
  formAllocations: number
}

/**
 * GET handler for fetching analytics statistics
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestContext = logger.createRequestContext(request)

  // Validate session authentication
  const authError = await validateSessionAuth(request)
  if (authError) {
    logger.logRequest(
      requestContext,
      {
        status: authError.status,
        statusText: "Unauthorized",
        duration: Date.now() - startTime,
        dataSize: 0,
      },
      [],
      {
        endpoint: "analytics/stats",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    // Ensure indexes are created for optimal query performance
    await ensureAnalyticsIndexes()

    // Parse time filter from query parameters
    const { searchParams } = new URL(request.url)
    const timeFilter = searchParams.get("timeFilter") || "7d"

    // Calculate the start date based on the filter
    const now = new Date()
    let startDate: Date
    switch (timeFilter) {
      case "6h":
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000)
        break
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "3d":
        startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
        break
      case "7d":
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
    }

    const collection = await getNCCollection("logs")

    // Optimized aggregation pipeline for time-series data
    // Groups by date and calculates counts in MongoDB (much faster than processing in Node.js)
    // Uses indexes on (domain, timestamp) for optimal performance
    const timeSeriesPipeline = [
      {
        $match: {
          domain: { $in: ["page view", "article allocator"] },
          timestamp: { $gte: startDate }, // Filter by time range
        },
      },
      {
        $group: {
          _id: {
            // For 6h and 24h filters, group by hour; otherwise group by day
            $dateToString: {
              format: timeFilter === "6h" || timeFilter === "24h" ? "%Y-%m-%d %H:00" : "%Y-%m-%d",
              date: "$timestamp",
            },
          },
          pageViews: {
            $sum: {
              $cond: [{ $eq: ["$domain", "page view"] }, 1, 0],
            },
          },
          formAllocations: {
            $sum: {
              $cond: [{ $eq: ["$domain", "article allocator"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date ascending
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          pageViews: 1,
          formAllocations: 1,
        },
      },
    ]

    // Execute aggregation pipeline
    const timeSeriesData = await collection
      .aggregate<TimeSeriesDataPoint>(timeSeriesPipeline)
      .toArray()

    // Calculate totals using optimized aggregation (faster than summing in Node.js)
    const totalsPipeline = [
      {
        $match: {
          domain: { $in: ["page view", "article allocator"] },
          timestamp: { $gte: startDate }, // Filter by time range
        },
      },
      {
        $group: {
          _id: null,
          totalPageViews: {
            $sum: {
              $cond: [{ $eq: ["$domain", "page view"] }, 1, 0],
            },
          },
          formAllocationCount: {
            $sum: {
              $cond: [{ $eq: ["$domain", "article allocator"] }, 1, 0],
            },
          },
        },
      },
    ]

    const totalsResult = await collection.aggregate(totalsPipeline).toArray()
    const totals = totalsResult[0] || { totalPageViews: 0, formAllocationCount: 0 }
    const totalPageViews = totals.totalPageViews || 0
    const formAllocationCount = totals.formAllocationCount || 0

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify({ timeSeriesData, totalPageViews, formAllocationCount }).length

    logger.logRequest(
      requestContext,
      {
        status: 200,
        statusText: "OK",
        duration,
        dataSize: responseSize,
      },
      [],
      {
        endpoint: "analytics/stats",
        dataPoints: timeSeriesData.length,
        totalPageViews,
        formAllocationCount,
        timeFilter,
      }
    )

    return NextResponse.json({
      timeSeriesData,
      totalPageViews,
      formAllocationCount,
    })
  } catch (error) {
    const duration = Date.now() - startTime

    logger.logRequest(
      requestContext,
      {
        status: 500,
        statusText: "Internal Server Error",
        duration,
        dataSize: 0,
      },
      [],
      {
        endpoint: "analytics/stats",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    )

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

