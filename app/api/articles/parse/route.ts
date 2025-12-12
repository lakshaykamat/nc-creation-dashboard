/**
 * API Route for Parsing Article Data
 * 
 * POST /api/articles/parse
 * 
 * Parses article data from array of strings in format "ARTICLE_ID [PAGES]".
 * 
 * @module app/api/articles/parse
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { parseNewArticlesWithPages } from "@/lib/file-allocator/articles/parse-article-utils"
import type { ParseArticlesRequest, ParseArticlesResponse } from "@/types/api-articles"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * POST handler for parsing article data
 */
export async function POST(request: NextRequest) {
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
        endpoint: "articles/parse",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    const body: ParseArticlesRequest = await request.json()

    // Validate request body
    if (!body.newArticlesWithPages || !Array.isArray(body.newArticlesWithPages)) {
      return NextResponse.json(
        { error: "newArticlesWithPages is required and must be an array" },
        { status: 400 }
      )
    }

    // Parse articles
    const parsedArticles = parseNewArticlesWithPages(body.newArticlesWithPages)

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify({ parsedArticles }).length

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
        endpoint: "articles/parse",
        inputCount: body.newArticlesWithPages.length,
        parsedCount: parsedArticles.length,
      }
    )

    const response: ParseArticlesResponse = {
      parsedArticles,
    }

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - startTime

    logger.logRequest(
      requestContext,
      {
        status: 500,
        statusText: "Internal Server Error",
        duration,
        dataSize: 0,
      },
      [],
      {
        endpoint: "articles/parse",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    )

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

