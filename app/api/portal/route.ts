/**
 * API Route for Portal Data
 * 
 * GET /api/portal
 * 
 * Fetches and processes portal workflow data, combining it with recent files data
 * to determine allocation status. Returns processed portal data with allocation information.
 * 
 * @module app/api/portal
 */

import { NextRequest, NextResponse } from "next/server"
import { extractRows } from "@/lib/portal-data/processing/extract-rows"
import { fetchPortalHtml } from "@/lib/portal-data/fetchers/portal-html-fetcher-utils"
import { fetchLastTwoDaysFilesData } from "@/lib/portal-data/fetchers/last-two-days-files-fetcher-utils"
import { buildDoneByMap } from "@/lib/portal-data/processing/done-by-map-utils"
import { combinePortalData } from "@/lib/portal-data/processing/portal-data-combiner-utils"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { PORTAL_WORKFLOW_URL } from "@/lib/constants/portal-constants"

// Force dynamic rendering - never cache on the server
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
        endpoint: "portal",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    const externalApiCalls: Array<{
      url: string
      method: string
      status: number
      duration: number
      error?: string
    }> = []

    // Fetch portal HTML
    const portalStartTime = Date.now()
    let html: string
    try {
      html = await fetchPortalHtml()
      externalApiCalls.push(
        logger.logExternalApiCall(
          PORTAL_WORKFLOW_URL,
          "POST",
          portalStartTime,
          200
        )
      )
    } catch (error) {
      externalApiCalls.push(
        logger.logExternalApiCall(
          PORTAL_WORKFLOW_URL,
          "POST",
          portalStartTime,
          0,
          error instanceof Error ? error.message : String(error)
        )
      )
      throw error
    }

    // Fetch last two days files data from internal API route
    const lastTwoDaysFilesData = await fetchLastTwoDaysFilesData(request)

    // Process data in parallel
    const processStartTime = Date.now()
    const [extractedRows, doneByMap] = await Promise.all([
      Promise.resolve(extractRows(html)),
      Promise.resolve(buildDoneByMap(lastTwoDaysFilesData)),
    ])
    const processDuration = Date.now() - processStartTime

    // Combine portal data with last two days files data
    const portalData = combinePortalData(extractedRows, doneByMap)

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify({ data: portalData }).length

    logger.logRequest(
      requestContext,
      {
        status: 200,
        statusText: "OK",
        duration,
        dataSize: responseSize,
      },
      externalApiCalls,
      {
        endpoint: "portal",
        recordCount: portalData.length,
        hasData: portalData.length > 0,
        processingDuration: processDuration,
        htmlSize: html.length,
        lastTwoDaysFilesCount: lastTwoDaysFilesData.length,
      }
    )

    return NextResponse.json({ data: portalData })
  } catch (error) {
    logger.logError(requestContext, error, {
      endpoint: "portal",
      duration: Date.now() - startTime,
    })

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch portal data"

    return NextResponse.json(
      {
        code: 500,
        message: errorMessage,
      },
      { status: 500 }
    )
  }
}

