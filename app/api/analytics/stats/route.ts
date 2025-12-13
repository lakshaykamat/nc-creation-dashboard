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
import { aggregateDocuments } from "@/lib/db/nc-operations"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

interface TimeSeriesDataPoint {
  date: string
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

    const timeSeriesPipeline = [
      {
        $match: {
          domain: "article allocator",
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: timeFilter === "6h" || timeFilter === "24h" ? "%Y-%m-%d %H:00" : "%Y-%m-%d",
              date: "$timestamp",
              timezone: "Asia/Kolkata",
            },
          },
          formAllocations: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          formAllocations: 1,
        },
      },
    ]

    const timeSeriesData = await aggregateDocuments<TimeSeriesDataPoint>("logs", timeSeriesPipeline)

    const totalsPipeline = [
      {
        $match: {
          domain: "article allocator",
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          formAllocationCount: { $sum: 1 },
        },
      },
    ]

    const totalsResult = await aggregateDocuments("logs", totalsPipeline)
    const totals = totalsResult[0] || { formAllocationCount: 0 }
    const formAllocationCount = totals.formAllocationCount || 0

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify({ timeSeriesData, formAllocationCount }).length

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
        formAllocationCount,
        timeFilter,
      }
    )

    return NextResponse.json({
      timeSeriesData,
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

