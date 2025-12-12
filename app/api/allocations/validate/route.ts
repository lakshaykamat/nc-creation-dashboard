/**
 * API Route for Validating Allocation
 * 
 * POST /api/allocations/validate
 * 
 * Validates allocation data including DDN articles and over-allocation checks.
 * 
 * @module app/api/allocations/validate
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { calculateAllocatedArticleCount, calculateRemainingArticles } from "@/lib/file-allocator/allocation/allocation-calculation-utils"
import { isOverAllocated, validateDdnArticles } from "@/lib/file-allocator/allocation/allocation-validation-utils"
import type { ValidateAllocationRequest, ValidateAllocationResponse } from "@/types/api-allocations"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * POST handler for validating allocation
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
        endpoint: "allocations/validate",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    const body: ValidateAllocationRequest = await request.json()

    // Validate request body
    if (!body.priorityFields || !Array.isArray(body.priorityFields)) {
      return NextResponse.json(
        { error: "priorityFields is required and must be an array" },
        { status: 400 }
      )
    }

    // Calculate allocation metrics
    const allocatedArticleCount = calculateAllocatedArticleCount(body.priorityFields)
    const remainingArticles = calculateRemainingArticles(body.totalArticles, allocatedArticleCount)
    const overAllocated = isOverAllocated(body.totalArticles, allocatedArticleCount)

    // Validate DDN articles if provided
    let ddnValidationError: string | null = null
    if (body.ddnText !== undefined) {
      const ddnValidation = validateDdnArticles(body.ddnText, body.availableArticleIds || [])
      ddnValidationError = ddnValidation.error
    }

    // Collect all errors
    const errors: string[] = []
    if (overAllocated) {
      errors.push(`Over-allocated: ${allocatedArticleCount} articles allocated but only ${body.totalArticles} available`)
    }
    if (ddnValidationError) {
      errors.push(ddnValidationError)
    }

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify({ isOverAllocated: overAllocated, remainingArticles, allocatedArticleCount, ddnValidationError, errors }).length

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
        endpoint: "allocations/validate",
        totalArticles: body.totalArticles,
        allocatedArticleCount,
        remainingArticles,
        isOverAllocated: overAllocated,
      }
    )

    const response: ValidateAllocationResponse = {
      isOverAllocated: overAllocated || !!ddnValidationError,
      remainingArticles,
      allocatedArticleCount,
      ddnValidationError,
      errors,
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
        endpoint: "allocations/validate",
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

