/**
 * API Route for Team Member Update and Delete Operations
 * 
 * PUT /api/teams/[id] - Update a team member
 * DELETE /api/teams/[id] - Delete a team member
 * 
 * @module app/api/teams/[id]
 */

import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db/mongo"
import { logger } from "@/lib/common/logger"
import { validateSessionAuth } from "@/lib/api/auth-middleware"
import { findByIdFilter, excludeByIdFilter } from "@/lib/db/mongo-helpers"
import { DATABASE_NAME } from "@/lib/constants/database-constants"
import type { TeamMember, UpdateTeamMemberRequest, TeamMemberResponse } from "@/types/teams"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * PUT handler - Update a team member
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        endpoint: "teams/[id]",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    const { id } = await params

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      const response: TeamMemberResponse = {
        success: false,
        error: "Invalid team member ID",
      }
      return NextResponse.json(response, { status: 400 })
    }

    const body: UpdateTeamMemberRequest = await request.json()

    // Validate request body
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      const response: TeamMemberResponse = {
        success: false,
        error: "Name is required and must be a non-empty string",
      }
      return NextResponse.json(response, { status: 400 })
    }

    const name = body.name.trim()

    const client = await clientPromise
    const db = client.db(DATABASE_NAME)
    const collection = db.collection<TeamMember>("teams")

    // Check if member exists
    const existingMember = await collection.findOne(findByIdFilter(id))
    if (!existingMember) {
      const response: TeamMemberResponse = {
        success: false,
        error: "Team member not found",
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Check for duplicate name (excluding current member)
    const duplicateMember = await collection.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      ...excludeByIdFilter(id),
    })
    if (duplicateMember) {
      const response: TeamMemberResponse = {
        success: false,
        error: "A team member with this name already exists",
      }
      return NextResponse.json(response, { status: 409 })
    }

    // Update member
    await collection.updateOne(
      findByIdFilter(id),
      { $set: { name } }
    )

    const updatedMember: TeamMember = {
      _id: id,
      name,
    }

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify({ data: updatedMember }).length

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
        endpoint: "teams/[id]",
        method: "PUT",
        memberId: id,
        memberName: name,
      }
    )

    const response: TeamMemberResponse = {
      success: true,
      data: updatedMember,
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
        endpoint: "teams/[id]",
        method: "PUT",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    )

    const response: TeamMemberResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update team member",
    }

    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * DELETE handler - Delete a team member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        endpoint: "teams/[id]",
        error: "Unauthorized session",
      }
    )
    return authError
  }

  try {
    const { id } = await params

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      const response: TeamMemberResponse = {
        success: false,
        error: "Invalid team member ID",
      }
      return NextResponse.json(response, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(DATABASE_NAME)
    const collection = db.collection<TeamMember>("teams")

    // Check if member exists
    const existingMember = await collection.findOne(findByIdFilter(id))
    if (!existingMember) {
      const response: TeamMemberResponse = {
        success: false,
        error: "Team member not found",
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Delete member
    await collection.deleteOne(findByIdFilter(id))

    const duration = Date.now() - startTime

    logger.logRequest(
      requestContext,
      {
        status: 200,
        statusText: "OK",
        duration,
        dataSize: 0,
      },
      [],
      {
        endpoint: "teams/[id]",
        method: "DELETE",
        memberId: id,
        memberName: existingMember.name,
      }
    )

    const response: TeamMemberResponse = {
      success: true,
      message: "Team member deleted successfully",
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
        endpoint: "teams/[id]",
        method: "DELETE",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    )

    const response: TeamMemberResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete team member",
    }

    return NextResponse.json(response, { status: 500 })
  }
}

