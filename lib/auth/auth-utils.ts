import type {
  UserRole,
  LoginCredentials,
  AuthValidationResult,
} from "@/types/auth"

// Re-export for backward compatibility
export type { UserRole, LoginCredentials, AuthValidationResult }

/**
 * Get the expected password for a given role from environment variables
 */
export function getExpectedPassword(role: UserRole): string | null {
  if (role === "MEMBER") {
    return process.env.NEXT_PUBLIC_MEMBER_PASSWORD || null
  }
  if (role === "ADMIN") {
    return process.env.NEXT_PUBLIC_ADMIN_PASSWORD || null
  }
  return null
}

/**
 * Validate login credentials
 */
export function validateCredentials(credentials: LoginCredentials): {
  valid: boolean
  error?: string
} {
  const { role, password } = credentials

  // Validate role
  if (!role || (role !== "MEMBER" && role !== "ADMIN")) {
    return {
      valid: false,
      error: "Invalid role. Must be MEMBER or ADMIN",
    }
  }

  // Validate password is provided
  if (!password || password.trim().length === 0) {
    return {
      valid: false,
      error: "Password is required",
    }
  }

  // Get expected password
  const expectedPassword = getExpectedPassword(role)
  if (!expectedPassword) {
    return {
      valid: false,
      error: "Server configuration error: Password not set for this role",
    }
  }

  // Validate password matches
  if (password !== expectedPassword) {
    return {
      valid: false,
      error: "Invalid password",
    }
  }

  return { valid: true }
}

// Re-export constants for backward compatibility
export { AUTH_COOKIE_CONFIG, AUTH_COOKIE_NAMES } from "@/lib/constants/auth-constants"

