/**
 * API Route for Recent Files Data
 * 
 * GET /api/files/recent
 * 
 * Fetches last two days files data from external API.
 * Used to determine which articles are already allocated.
 * 
 * @module app/api/files/recent
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { N8N_WEBHOOK_ENDPOINTS } from "@/lib/constants/n8n-webhook-constants"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

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
        endpoint: "files/recent",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    const externalApiStartTime = Date.now()
    const externalUrl = N8N_WEBHOOK_ENDPOINTS.LAST_TWO_DAYS_FILES

    let response: Response
    let data: unknown
    let externalApiCall

    try {
      response = await fetch(externalUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Connection": "keep-alive",
        },
        cache: "no-store",
        keepalive: true,
      })

      data = await response.json()

      externalApiCall = logger.logExternalApiCall(
        externalUrl,
        "GET",
        externalApiStartTime,
        response.status
      )
    } catch (fetchError) {
      externalApiCall = logger.logExternalApiCall(
        externalUrl,
        "GET",
        externalApiStartTime,
        0,
        fetchError instanceof Error ? fetchError.message : String(fetchError)
      )

      throw fetchError
    }

    const duration = Date.now() - startTime

    if (!response.ok) {
      const errorMessage =
        (data as { message?: string })?.message || "Failed to fetch last two days files data"

      logger.logRequest(
        requestContext,
        {
          status: response.status,
          statusText: response.statusText,
          duration,
          error: {
            message: errorMessage,
            code: response.status,
          },
        },
        [externalApiCall],
        {
          externalApiError: true,
        }
      )

      return NextResponse.json(
        {
          code: response.status,
          message: errorMessage,
        },
        { status: response.status }
      )
    }

    // Validate response
    if (!Array.isArray(data)) {
      logger.logRequest(
        requestContext,
        {
          status: 500,
          statusText: "Internal Server Error",
          duration,
          error: {
            message: "Invalid response format: expected an array",
            code: "VALIDATION_ERROR",
          },
        },
        [externalApiCall]
      )

      return NextResponse.json(
        {
          code: 500,
          message: "Invalid response format: expected an array",
        },
        { status: 500 }
      )
    }

    const responseSize = JSON.stringify(data).length

    logger.logRequest(
      requestContext,
      {
        status: 200,
        statusText: "OK",
        duration,
        dataSize: responseSize,
      },
      [externalApiCall],
      {
        endpoint: "files/recent",
        recordCount: data.length,
        hasData: data.length > 0,
      }
    )

    return NextResponse.json(data)
  } catch (error) {
    logger.logError(requestContext, error, {
      endpoint: "last-two-days-files",
      duration: Date.now() - startTime,
    })

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch last two days files data"

    return NextResponse.json(
      {
        code: 500,
        message: errorMessage,
      },
      { status: 500 }
    )
  }
}

