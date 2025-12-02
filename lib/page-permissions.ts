import type { UserRole } from "./auth-utils"

export interface PagePermission {
  path: string
  label: string
  roles: UserRole[]
  enabled: boolean
}

export interface SidebarItem {
  path: string
  label: string
  icon?: string
  group?: string
  roles: UserRole[]
  enabled: boolean
  badge?: string
}

/**
 * Centralized page permissions configuration
 * Add or modify pages here to control access
 */
export const PAGE_PERMISSIONS: Record<string, PagePermission> = {
  "/": {
    path: "/",
    label: "Portal",
    roles: ["MEMBER", "ADMIN"],
    enabled: true,
  },
  "/work-history": {
    path: "/work-history",
    label: "Work History",
    roles: ["MEMBER", "ADMIN"],
    enabled: true,
  },
  "/file-allocator": {
    path: "/file-allocator",
    label: "File Allocator",
    roles: ["ADMIN"],
    enabled: true,
  },
}

/**
 * Sidebar navigation configuration
 * Controls which items appear in the sidebar for each role
 */
export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    path: "/",
    label: "Portal",
    icon: "Earth",
    group: "Navigation",
    roles: ["MEMBER", "ADMIN"],
    enabled: true,
  },
  {
    path: "/work-history",
    label: "Work History",
    icon: "BriefcaseBusiness",
    group: "Navigation",
    roles: ["MEMBER", "ADMIN"],
    enabled: true,
  },
  {
    path: "/file-allocator",
    label: "File Allocator",
    icon: "FolderTree",
    group: "TOOLS",
    roles: ["ADMIN"],
    enabled: true,
    badge: "New",
  },
]

/**
 * Check if a user role has access to a specific page
 */
export function canAccessPage(path: string, role: UserRole | null): boolean {
  if (!role) return false

  const permission = PAGE_PERMISSIONS[path]
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

