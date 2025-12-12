/**
 * API Route for Parsing Pasted Allocation Data
 * 
 * POST /api/articles/parse-pasted
 * 
 * Parses pasted allocation data to extract article IDs and pages.
 * 
 * @module app/api/articles/parse-pasted
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { parsePastedAllocation } from "@/lib/file-allocator/articles/parse-pasted-allocation"
import type { ParsePastedAllocationRequest, ParsePastedAllocationResponse } from "@/types/api-articles"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * POST handler for parsing pasted allocation data
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
        endpoint: "articles/parse-pasted",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    const body: ParsePastedAllocationRequest = await request.json()

    // Validate request body
    if (typeof body.pastedText !== "string") {
      return NextResponse.json(
        { error: "pastedText is required and must be a string" },
        { status: 400 }
      )
    }

    // Parse pasted data
    const entries = parsePastedAllocation(body.pastedText)

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify({ entries }).length

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
        endpoint: "articles/parse-pasted",
        entriesCount: entries.length,
        inputLength: body.pastedText.length,
      }
    )

    const response: ParsePastedAllocationResponse = {
      entries,
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
        endpoint: "articles/parse-pasted",
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

