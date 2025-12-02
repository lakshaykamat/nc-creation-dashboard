import { cookies } from "next/headers"
import { decryptPassword } from "@/lib/auth"
import {
  getExpectedPassword,
  AUTH_COOKIE_NAMES,
  type AuthValidationResult,
  type UserRole,
} from "@/lib/auth-utils"

export async function validateAuth(): Promise<AuthValidationResult> {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get(AUTH_COOKIE_NAMES.TOKEN)
    const authRole = cookieStore.get(AUTH_COOKIE_NAMES.ROLE)

    if (!authToken?.value || !authRole?.value) {
      return { valid: false }
    }

    // Decrypt and validate password
    const decryptedPassword = decryptPassword(authToken.value)
    const role = authRole.value as UserRole

    // Get the expected password using utility function
    const expectedPassword = getExpectedPassword(role)
    if (!expectedPassword) {
      return { valid: false }
    }

    // Validate that the decrypted password matches the expected password
    if (decryptedPassword !== expectedPassword) {
      return { valid: false }
    }

    return { valid: true, role }
  } catch (error) {
    console.error("Auth validation error:", error)
    return { valid: false }
  }
}

