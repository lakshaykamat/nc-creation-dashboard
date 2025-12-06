/**
 * API Route for Submitting Article Allocation
 * 
 * POST /api/submit-allocation
 * 
 * Submits the final allocation to the external webhook.
 * Transforms the allocation data into the required format.
 * 
 * @module app/api/submit-allocation
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import type { FinalAllocationResult } from "@/types/file-allocator"
import { transformAllocationToPayload } from "@/hooks/file-allocator/transform-allocation-to-payload"
import type { AllocationItem } from "@/types/file-allocator"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * POST handler for submitting allocation
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestContext = logger.createRequestContext(request)

  try {

    const body: FinalAllocationResult = await request.json()

    // Transform allocation data into required format
    const allocationItems = transformAllocationToPayload(body)

    // Submit to external webhook
    const apiKey = process.env.NEXT_PUBLIC_NC_API_KEY
    if (!apiKey) {
      logger.logRequest(
        requestContext,
        {
          status: 500,
          statusText: "Internal Server Error",
          duration: Date.now() - startTime,
          dataSize: 0,
        },
        [],
        {
          endpoint: "submit-allocation",
          error: "API key not configured",
        }
      )
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      )
    }

    const webhookUrl = "https://n8n-ex6e.onrender.com/webhook/update-allocation"

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(allocationItems),
    })

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify(allocationItems).length

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      
      logger.logRequest(
        requestContext,
        {
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          duration,
          dataSize: responseSize,
        },
        [
          {
            url: webhookUrl,
            method: "POST",
            status: webhookResponse.status,
            duration,
            error: errorText,
          },
        ],
        {
          endpoint: "submit-allocation",
          itemCount: allocationItems.length,
        }
      )

      return NextResponse.json(
        { 
          error: "Failed to submit allocation",
          details: errorText,
        },
        { status: webhookResponse.status }
      )
    }

    const responseData = await webhookResponse.json().catch(() => ({}))
    
    logger.logRequest(
      requestContext,
      {
        status: 200,
        statusText: "OK",
        duration,
        dataSize: responseSize,
      },
      [
        {
          url: webhookUrl,
          method: "POST",
          status: webhookResponse.status,
          duration,
        },
      ],
      {
        endpoint: "submit-allocation",
        itemCount: allocationItems.length,
        success: true,
      }
    )

    return NextResponse.json({
      success: true,
      message: "Allocation submitted successfully",
      itemCount: allocationItems.length,
      data: responseData,
    })

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
        endpoint: "submit-allocation",
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

