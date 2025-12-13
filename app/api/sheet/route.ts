import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { getNCCollection } from "@/lib/db/nc-database"

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
        endpoint: "sheet",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    const collection = await getNCCollection("sheet")

    // Fetch all documents from the sheet collection, sorted by Date descending (latest first)
    const documents = await collection
      .find({})
      .sort({ Date: -1 }) // Sort by Date descending
      .toArray()

    // Convert MongoDB ObjectId to string for JSON serialization
    const formattedDocuments = documents.map((doc) => ({
      _id: doc._id.toString(),
      Month: doc.Month || "",
      Date: doc.Date || "",
      "Article number": doc["Article number"] || "",
      Pages: doc.Pages || 0,
      Completed: doc.Completed || "",
      "Done by": doc["Done by"] || "",
      Time: doc.Time || "",
    }))

    const duration = Date.now() - startTime

    logger.logRequest(requestContext, {
      status: 200,
      statusText: "OK",
      duration,
      dataSize: formattedDocuments.length,
    })

    return NextResponse.json(
      {
        success: true,
        data: formattedDocuments,
        count: formattedDocuments.length,
      },
      { status: 200 }
    )
  } catch (error) {
    logger.logError(requestContext, error, {
      message: "Failed to fetch sheet data from MongoDB",
    })

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sheet data from MongoDB",
        message: errorMessage,
      },
      { status: 500 }
    )
  }
}

