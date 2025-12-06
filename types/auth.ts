/**
 * Type definitions for Authentication feature
 * 
 * @module types/auth
 */

/**
 * User role types
 */
export type UserRole = "MEMBER" | "ADMIN"

/**
 * Login credentials structure
 */
export interface LoginCredentials {
  role: UserRole
  password: string
}

/**
 * Authentication validation result
 */
export interface AuthValidationResult {
  valid: boolean
  role?: UserRole
}

/**
 * Page permission configuration
 */
export interface PagePermission {
  path: string
  label: string
  roles: UserRole[]
  enabled: boolean
}

/**
 * Sidebar item configuration
 */
export interface SidebarItem {
  path: string
  label: string
  icon?: string
  group?: string
  roles: UserRole[]
  enabled: boolean
  badge?: string
}

