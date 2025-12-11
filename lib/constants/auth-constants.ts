/**
 * Authentication Constants
 * 
 * Constants for authentication configuration
 * 
 * @module lib/constants/auth-constants
 */

/**
 * Cookie configuration constants
 */
export const AUTH_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  path: "/",
} as const

/**
 * Cookie names
 */
export const AUTH_COOKIE_NAMES = {
  TOKEN: "auth_token",
  ROLE: "auth_role",
} as const

