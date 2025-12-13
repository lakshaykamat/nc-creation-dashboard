/**
 * API Route for Fetching Analytics Logs
 * 
 * GET /api/analytics/logs
 * 
 * Fetches analytics logs from MongoDB "logs" collection
 * 
 * @module app/api/analytics/logs
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { findDocuments, countDocuments } from "@/lib/db/nc-operations"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * GET handler for fetching analytics logs
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
        endpoint: "analytics/logs",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100", 10)
    const domain = searchParams.get("domain")
    const skip = parseInt(searchParams.get("skip") || "0", 10)

    // Build query
    const query: Record<string, unknown> = {}
    if (domain) {
      query.domain = domain
    }

    // Fetch logs sorted by timestamp descending (most recent first)
    const logs = await findDocuments("logs", query, {
      sort: { timestamp: -1 },
      skip,
      limit,
    })

    // Get total count for pagination
    const totalCount = await countDocuments("logs", query)

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify(logs).length

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
        endpoint: "analytics/logs",
        logsCount: logs.length,
        totalCount,
        domain: domain || "all",
      }
    )

    return NextResponse.json({
      logs,
      totalCount,
      limit,
      skip,
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
        endpoint: "analytics/logs",
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

