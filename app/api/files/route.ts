import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import {
  getSampleAllocationData,
  shouldUseSampleData,
} from "@/lib/file-allocator/sample-allocation"
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
        endpoint: "files",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const recent = searchParams.get("recent")

    // Use sample data if enabled
    if (shouldUseSampleData()) {
      const data = getSampleAllocationData(recent)
      const duration = Date.now() - startTime
      const responseSize = JSON.stringify(data).length

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
          endpoint: "files",
          hasData: true,
          queryParams: {
            recent: recent || null,
          },
          usingSampleData: true,
        }
      )

      return NextResponse.json(data)
    }

    // Continue with external API fetch
    const apiKey = process.env.NEXT_PUBLIC_NC_API_KEY

    if (!apiKey) {
      logger.logRequest(requestContext, {
        status: 500,
        statusText: "Internal Server Error",
        duration: Date.now() - startTime,
        error: {
          message: "API key not configured",
          code: "CONFIG_ERROR",
        },
      })

      return NextResponse.json(
        {
          code: 500,
          message: "API key not configured",
        },
        { status: 500 }
      )
    }

    const externalApiStartTime = Date.now()
    
    // Build URL with query parameters
    let externalUrl = N8N_WEBHOOK_ENDPOINTS.ALLOCATIONS
    const urlParams = new URLSearchParams()
    if (recent) {
      urlParams.append("recent", recent)
    }
    
    if (urlParams.toString()) {
      externalUrl += `?${urlParams.toString()}`
    }

    let response: Response
    let data: unknown
    let externalApiCall

    try {
      response = await fetch(externalUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
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
        (data as { message?: string })?.message || "Failed to fetch file allocator data"

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
    if (!data || typeof data !== "object") {
      logger.logRequest(
        requestContext,
        {
          status: 500,
          statusText: "Internal Server Error",
          duration,
          error: {
            message: "Invalid response format",
            code: "VALIDATION_ERROR",
          },
        },
        [externalApiCall]
      )

      return NextResponse.json(
        {
          code: 500,
          message: "Invalid response format",
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
        endpoint: "file-allocator",
        hasData: true,
        queryParams: {
          recent: recent || null,
        },
      }
    )

    return NextResponse.json(data)
  } catch (error) {
    logger.logError(requestContext, error, {
      endpoint: "file-allocator",
      duration: Date.now() - startTime,
    })

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch file allocator data"

    return NextResponse.json(
      {
        code: 500,
        message: errorMessage,
      },
      { status: 500 }
    )
  }
}

