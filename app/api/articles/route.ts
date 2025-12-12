/**
 * Articles API Route
 * 
 * This file exists to satisfy Next.js route type validation.
 * Actual article parsing endpoints are:
 * - /api/articles/parse
 * - /api/articles/parse-pasted
 */

import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { 
      error: "Not Found",
      message: "This endpoint is not available. Use /api/articles/parse or /api/articles/parse-pasted instead."
    },
    { status: 404 }
  )
}

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { 
      error: "Not Found",
      message: "This endpoint is not available. Use /api/articles/parse or /api/articles/parse-pasted instead."
    },
    { status: 404 }
  )
}

