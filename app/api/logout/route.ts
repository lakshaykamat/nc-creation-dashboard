import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAMES } from "@/lib/auth/auth-utils"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const cookieStore = await cookies()

    cookieStore.delete(AUTH_COOKIE_NAMES.TOKEN)
    cookieStore.delete(AUTH_COOKIE_NAMES.ROLE)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

