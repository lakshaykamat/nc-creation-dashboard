import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAMES, type UserRole } from "@/lib/auth/auth-utils"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authRole = cookieStore.get(AUTH_COOKIE_NAMES.ROLE)

    if (!authRole?.value) {
      return NextResponse.json({ role: null }, { status: 200 })
    }

    const role = authRole.value as UserRole
    return NextResponse.json({ role })
  } catch (error) {
    console.error("Get user role error:", error)
    return NextResponse.json({ role: null }, { status: 200 })
  }
}

