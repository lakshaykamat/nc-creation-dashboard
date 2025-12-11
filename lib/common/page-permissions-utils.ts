/**
 * Page Permissions Utility Functions
 * 
 * Pure utility functions for checking page access and filtering sidebar items
 * 
 * @module lib/common/page-permissions-utils
 */

import type { UserRole, SidebarItem } from "@/types/auth"
import { PAGE_PERMISSIONS, SIDEBAR_ITEMS } from "@/lib/constants/page-permissions"

/**
 * Check if a user role has access to a specific page
 * Also checks parent routes if exact path is not found
 */
export function canAccessPage(path: string, role: UserRole | null): boolean {
  if (!role) return false

  // First, check exact path
  let permission = PAGE_PERMISSIONS[path]
  
  // If not found, check parent routes (e.g., /file-allocator/form -> /file-allocator)
  if (!permission && path.includes("/")) {
    const pathParts = path.split("/").filter(Boolean)
    for (let i = pathParts.length; i > 0; i--) {
      const parentPath = "/" + pathParts.slice(0, i).join("/")
      permission = PAGE_PERMISSIONS[parentPath]
      if (permission) break
    }
  }

  if (!permission) return false

  if (!permission.enabled) return false

  return permission.roles.includes(role)
}

/**
 * Get sidebar items filtered by user role
 */
export function getSidebarItemsForRole(role: UserRole | null): SidebarItem[] {
  if (!role) return []

  return SIDEBAR_ITEMS.filter(
    (item) => item.enabled && item.roles.includes(role)
  )
}

/**
 * Get sidebar items grouped by group name
 */
export function getGroupedSidebarItems(
  role: UserRole | null
): Record<string, SidebarItem[]> {
  const items = getSidebarItemsForRole(role)
  const grouped: Record<string, SidebarItem[]> = {}

  items.forEach((item) => {
    const group = item.group || "Other"
    if (!grouped[group]) {
      grouped[group] = []
    }
    grouped[group].push(item)
  })

  return grouped
}

