import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { encryptPassword } from "@/lib/auth"
import {
  validateCredentials,
  AUTH_COOKIE_CONFIG,
  AUTH_COOKIE_NAMES,
  type LoginCredentials,
} from "@/lib/auth-utils"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const credentials: LoginCredentials = {
      role: body.role,
      password: body.password,
    }

    // Validate credentials using utility function
    const validation = validateCredentials(credentials)
    if (!validation.valid) {
      const statusCode = validation.error?.includes("Invalid password") ? 401 : 400
      return NextResponse.json(
        { error: validation.error || "Invalid credentials" },
        { status: statusCode }
      )
    }

    // Encrypt password and set cookies
    const encryptedPassword = encryptPassword(credentials.password)
    const cookieStore = await cookies()

    cookieStore.set(AUTH_COOKIE_NAMES.TOKEN, encryptedPassword, AUTH_COOKIE_CONFIG)
    cookieStore.set(AUTH_COOKIE_NAMES.ROLE, credentials.role, AUTH_COOKIE_CONFIG)

    return NextResponse.json({ success: true, role: credentials.role })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

