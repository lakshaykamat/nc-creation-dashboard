import { NextResponse } from "next/server"
import { extractRows } from "@/lib/extract-rows"
import { fetchPortalHtml, fetchLastTwoDaysFilesData, buildDoneByMap } from "@/lib/portal-fetcher"
import { combinePortalData } from "@/lib/combine-portal-data"

// Force dynamic rendering - never cache on the server
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Fetch both sources in parallel
    const [html, lastTwoDaysFilesData] = await Promise.all([
      fetchPortalHtml(),
      fetchLastTwoDaysFilesData(),
    ])

    // Process data in parallel
    const [extractedRows, doneByMap] = await Promise.all([
      Promise.resolve(extractRows(html)),
      Promise.resolve(buildDoneByMap(lastTwoDaysFilesData)),
    ])

    // Combine portal data with last two days files data
    const portalData = combinePortalData(extractedRows, doneByMap)

    return NextResponse.json({ data: portalData })
  } catch (error) {
    console.error("Error fetching portal data:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch portal data"
    
    return NextResponse.json(
      {
        code: 500,
        message,
      },
      { status: 500 }
    )
  }
}

