import { NextResponse } from "next/server"
import { extractRows } from "@/lib/extract-rows"
import { fetchPortalHtml, fetchLastTwoDaysFilesData, buildDoneByMap } from "@/lib/portal-fetcher"
import { combinePortalData } from "@/lib/combine-portal-data"

// Remove: export const dynamic = "force-dynamic"
// Remove: export const revalidate = 0
export const revalidate = 30 // Cache for 30 seconds on server

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

    return NextResponse.json(
      { data: portalData },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
        }
      }
    )
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

