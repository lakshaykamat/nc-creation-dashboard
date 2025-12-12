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


