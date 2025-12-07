import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/db/mongo"
import { logger } from "@/lib/common/logger"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestContext = logger.createRequestContext(request)

  try {
    const client = await clientPromise
    const db = client.db("nc")
    const collection = db.collection("sheet")

    // Fetch all documents from the sheet collection
    const documents = await collection.find({}).toArray()

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
      message: "Failed to fetch backup data from MongoDB",
    })

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch backup data from MongoDB",
        message: errorMessage,
      },
      { status: 500 }
    )
  }
}

