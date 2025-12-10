/**
 * API Route for Teams CRUD Operations
 * 
 * GET /api/teams - List all team members
 * POST /api/teams - Create a new team member
 * 
 * @module app/api/teams
 */

import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db/mongo"
import { logger } from "@/lib/common/logger"
import type { TeamMember, CreateTeamMemberRequest, TeamMembersResponse, TeamMemberResponse } from "@/types/teams"

// Force dynamic rendering - never cache
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * GET handler - Fetch all team members
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestContext = logger.createRequestContext(request)

  try {
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection<TeamMember>("teams")

    const members = await collection.find({}).toArray()

    // Convert ObjectId to string for JSON serialization
    const membersWithStringIds = members.map((member) => ({
      _id: member._id.toString(),
      name: member.name,
    }))

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify({ data: membersWithStringIds }).length

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
        endpoint: "teams",
        method: "GET",
        memberCount: membersWithStringIds.length,
      }
    )

    const response: TeamMembersResponse = {
      success: true,
      data: membersWithStringIds,
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
        endpoint: "teams",
        method: "GET",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    )

    const response: TeamMembersResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch team members",
    }

    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * POST handler - Create a new team member
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestContext = logger.createRequestContext(request)

  try {
    const body: CreateTeamMemberRequest = await request.json()

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
    const db = client.db()
    const collection = db.collection<TeamMember>("teams")

    // Check for duplicate name
    const existingMember = await collection.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
    if (existingMember) {
      const response: TeamMemberResponse = {
        success: false,
        error: "A team member with this name already exists",
      }
      return NextResponse.json(response, { status: 409 })
    }

    // Insert new member
    const result = await collection.insertOne({
      name,
    } as TeamMember)

    const newMember: TeamMember = {
      _id: result.insertedId.toString(),
      name,
    }

    const duration = Date.now() - startTime
    const responseSize = JSON.stringify({ data: newMember }).length

    logger.logRequest(
      requestContext,
      {
        status: 201,
        statusText: "Created",
        duration,
        dataSize: responseSize,
      },
      [],
      {
        endpoint: "teams",
        method: "POST",
        memberId: newMember._id,
        memberName: newMember.name,
      }
    )

    const response: TeamMemberResponse = {
      success: true,
      data: newMember,
    }

    return NextResponse.json(response, { status: 201 })
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
        endpoint: "teams",
        method: "POST",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    )

    const response: TeamMemberResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create team member",
    }

    return NextResponse.json(response, { status: 500 })
  }
}

