/**
 * API Route for Computing Article Distribution
 * 
 * POST /api/allocations/compute
 * 
 * Computes article distribution to team members based on allocation method.
 * 
 * @module app/api/allocations/compute
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { distributeArticles } from "@/lib/file-allocator/allocation/allocation-distribution-utils"
import type { ComputeAllocationRequest, ComputeAllocationResponse } from "@/types/api-allocations"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * POST handler for computing article distribution
 */
export async function POST(request: NextRequest) {
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
        endpoint: "allocations/compute",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    const body: ComputeAllocationRequest = await request.json()

    // Validate request body
    if (!body.priorityFields || !Array.isArray(body.priorityFields)) {
      return NextResponse.json(
        { error: "priorityFields is required and must be an array" },
        { status: 400 }
      )
    }

    if (!body.parsedArticles || !Array.isArray(body.parsedArticles)) {
      return NextResponse.json(
        { error: "parsedArticles is required and must be an array" },
        { status: 400 }
      )
    }

    // Compute distribution
    const allocatedArticles = distributeArticles(
      body.priorityFields,
      body.parsedArticles,
      body.ddnArticles || [],
      body.allocationMethod || "allocate by priority",
      body.month,
      body.date
    )

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify({ allocatedArticles }).length

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
        endpoint: "allocations/compute",
        allocatedCount: allocatedArticles.length,
      }
    )

    const response: ComputeAllocationResponse = {
      allocatedArticles,
    }

    return NextResponse.json(response)
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
        endpoint: "allocations/compute",
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

