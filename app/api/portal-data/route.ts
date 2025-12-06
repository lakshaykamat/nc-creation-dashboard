import { NextRequest, NextResponse } from "next/server"
import { extractRows } from "@/lib/portal-data/extract-rows"
import { fetchPortalHtml, fetchLastTwoDaysFilesData, buildDoneByMap } from "@/lib/portal-data/portal-fetcher"
import { combinePortalData } from "@/lib/portal-data/combine-portal-data"
import { logger } from "@/lib/common/logger"

// Force dynamic rendering - never cache on the server
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestContext = logger.createRequestContext(request)

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
          "https://powertrack3.aptaracorp.com/AptaraVendorAPI/vendorWorkflow.html",
          "POST",
          portalStartTime,
          200
        )
      )
    } catch (error) {
      externalApiCalls.push(
        logger.logExternalApiCall(
          "https://powertrack3.aptaracorp.com/AptaraVendorAPI/vendorWorkflow.html",
          "POST",
          portalStartTime,
          0,
          error instanceof Error ? error.message : String(error)
        )
      )
      throw error
    }

    // Fetch last two days files data
    const filesStartTime = Date.now()
    let lastTwoDaysFilesData
    try {
      lastTwoDaysFilesData = await fetchLastTwoDaysFilesData()
      externalApiCalls.push(
        logger.logExternalApiCall(
          "https://n8n-ex6e.onrender.com/webhook/last-two-days-files",
          "GET",
          filesStartTime,
          200
        )
      )
    } catch (error) {
      externalApiCalls.push(
        logger.logExternalApiCall(
          "https://n8n-ex6e.onrender.com/webhook/last-two-days-files",
          "GET",
          filesStartTime,
          0,
          error instanceof Error ? error.message : String(error)
        )
      )
      throw error
    }

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
        endpoint: "portal-data",
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
      endpoint: "portal-data",
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

