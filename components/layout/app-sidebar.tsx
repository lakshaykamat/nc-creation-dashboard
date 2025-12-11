"use client"

import * as React from "react"
import { Earth, BriefcaseBusiness, FolderTree, Settings, Database, User, LogOut, Users, Mail, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { Button } from "../ui/button"
import { useUserRole } from "@/hooks/auth/use-user-role"
import { useAuth } from "@/hooks/auth/use-auth"
import { Skeleton } from "../ui/skeleton"
import { getGroupedSidebarItems } from "@/lib/common/page-permissions-utils"
import { Separator } from "../ui/separator"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { role, isLoading: isLoadingRole } = useUserRole()
  const { logout, isLoggingOut } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const groupedItems = React.useMemo(
    () => getGroupedSidebarItems(role),
    [role]
  )

  const iconMap: Record<string, LucideIcon> = {
    Earth,
    BriefcaseBusiness,
    FolderTree,
    Settings,
    Database,
    Users,
    Mail,
  }

  const getIcon = (iconName?: string) => {
    if (!iconName) return null
    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <h2 className="text-lg font-semibold">NC Creation</h2>
        </div>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <SidebarGroup key={groupName}>
            <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
          <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      className="py-6 px-4 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold hover:bg-primary/5 hover:text-foreground transition-colors"
                      isActive={pathname === item.path}
                    >
                      <Link
                        href={item.path}
                        className={
                          item.badge
                            ? "flex items-center justify-between w-full"
                            : "flex items-center gap-2"
                        }
                      >
                        <div className="flex items-center gap-2">
                          {getIcon(item.icon)}
                          {item.label}
                        </div>
                        {item.badge && (
                          <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-destructive/60 hover:bg-destructive/70 hover:text-destructive-foreground w-full py-6 px-4 justify-start gap-2 hover:cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
          <div className="flex items-center gap-2 py-3 px-2 rounded-md hover:bg-muted">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            {isLoadingRole ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span className="text-sm font-medium">
                {role || "Unknown"}
              </span>
            )}
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
