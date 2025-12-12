/**
 * Portal Data API Route
 * 
 * This file exists to satisfy Next.js route type validation.
 * The actual portal endpoint is /api/portal
 */

import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { 
      error: "Not Found",
      message: "This endpoint has been moved. Use /api/portal instead."
    },
    { status: 404 }
  )
}

