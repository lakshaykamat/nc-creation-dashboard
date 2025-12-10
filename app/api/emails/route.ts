/**
 * API Route for Fetching Emails
 * 
 * GET /api/emails - Fetch emails from external webhook
 * 
 * @module app/api/emails
 */

import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/common/logger"
import type { EmailsResponse } from "@/types/emails"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * GET handler - Fetch emails from external webhook
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestContext = logger.createRequestContext(request)

  try {
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
          endpoint: "emails",
          error: "API key not configured",
        }
      )
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      )
    }

    const webhookUrl = "https://n8n-ex6e.onrender.com/webhook/today-emails"

    const webhookResponse = await fetch(webhookUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      cache: "no-store",
    })

    const duration = Date.now() - startTime

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      
      logger.logRequest(
        requestContext,
        {
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          duration,
          dataSize: 0,
        },
        [
          {
            url: webhookUrl,
            method: "GET",
            status: webhookResponse.status,
            duration,
            error: errorText,
          },
        ],
        {
          endpoint: "emails",
          error: errorText,
        }
      )

      return NextResponse.json(
        { 
          error: "Failed to fetch emails",
          details: errorText,
        },
        { status: webhookResponse.status }
      )
    }

    const emails: EmailsResponse = await webhookResponse.json()
    const responseSize = JSON.stringify(emails).length

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
          method: "GET",
          status: webhookResponse.status,
          duration,
        },
      ],
      {
        endpoint: "emails",
        emailCount: Array.isArray(emails) ? emails.length : 0,
        success: true,
      }
    )

    return NextResponse.json({ data: emails })
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
        endpoint: "emails",
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

