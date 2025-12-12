/**
 * API Route for Computing Allocation Preview
 * 
 * POST /api/allocations/preview
 * 
 * Computes preview/display articles including allocated, unallocated, and display overrides.
 * 
 * @module app/api/allocations/preview
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { distributeArticles } from "@/lib/file-allocator/allocation/allocation-distribution-utils"
import { getUnallocatedArticles } from "@/lib/file-allocator/articles/unallocated-articles-extraction-utils"
import type { PreviewAllocationRequest, PreviewAllocationResponse } from "@/types/api-allocations"
import type { AllocatedArticle } from "@/types/file-allocator"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * POST handler for computing allocation preview
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
        endpoint: "allocations/preview",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    const body: PreviewAllocationRequest = await request.json()

    // Validate request body
    if (!body.priorityFields || !Array.isArray(body.priorityFields)) {
      return NextResponse.json(
        { error: "priorityFields is required and must be an array" },
        { status: 400 }
      )
    }

    if (!body.parsedArticles || !Array.isArray(body.parsedArticles)) {
      return NextResponse.json(
        { error: "parsedArticles is required and must be an array" },
        { status: 400 }
      )
    }

    // Compute allocated articles
    const allocatedArticles = distributeArticles(
      body.priorityFields,
      body.parsedArticles,
      body.ddnArticles || [],
      body.allocationMethod || "allocate by priority",
      body.month,
      body.date
    )

    // Get allocated article IDs
    const allocatedArticleIds = new Set(allocatedArticles.map((a) => a.articleId))

    // Compute unallocated articles
    const unallocatedArticles = getUnallocatedArticles(
      body.parsedArticles,
      allocatedArticleIds,
      body.allocationMethod || "allocate by priority",
      body.month,
      body.date
    )

    // Combine and apply display overrides
    let displayArticles: AllocatedArticle[] = [...allocatedArticles, ...unallocatedArticles]
    
    if (body.articleDisplayOverrides && Object.keys(body.articleDisplayOverrides).length > 0) {
      displayArticles = displayArticles.map((article) => {
        const override = body.articleDisplayOverrides![article.articleId]
        if (override) {
          return { ...article, ...override }
        }
        return article
      })
    }

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify({ allocatedArticles, unallocatedArticles, displayArticles }).length

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
        endpoint: "allocations/preview",
        allocatedCount: allocatedArticles.length,
        unallocatedCount: unallocatedArticles.length,
        displayCount: displayArticles.length,
      }
    )

    const response: PreviewAllocationResponse = {
      allocatedArticles,
      unallocatedArticles,
      displayArticles,
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
        endpoint: "allocations/preview",
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

