import type { UserRole, PagePermission, SidebarItem } from "@/types/auth"

// Re-export for backward compatibility
export type { PagePermission, SidebarItem }

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
  "/file-allocator/form": {
    path: "/file-allocator/form",
    label: "File Allocator Form",
    roles: ["ADMIN"],
    enabled: true,
  },
  "/settings": {
    path: "/settings",
    label: "Settings",
    roles: ["MEMBER", "ADMIN"],
    enabled: true,
  },
  "/sheet-data": {
    path: "/sheet-data",
    label: "Sheet Data",
    roles: ["ADMIN"],
    enabled: true,
  },
  "/teams": {
    path: "/teams",
    label: "Team",
    roles: ["ADMIN"],
    enabled: true,
  },
  "/emails": {
    path: "/emails",
    label: "Emails",
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
    path: "/sheet-data",
    label: "Sheet Data",
    icon: "Database",
    group: "Tools",
    roles: ["MEMBER", "ADMIN"],
    enabled: true,
  },
  {
    path: "/teams",
    label: "Team",
    icon: "Users",
    group: "Navigation",
    roles: ["ADMIN"],
    enabled: true,
  },
  {
    path: "/emails",
    label: "Emails",
    icon: "Mail",
    group: "Tools",
    roles: ["ADMIN"],
    enabled: true,
    badge: "CHECK BABY",
  },
  {
    path: "/settings",
    label: "Settings",
    icon: "Settings",
    group: "Navigation",
    roles: ["MEMBER", "ADMIN"],
    enabled: true,
  },
]

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

