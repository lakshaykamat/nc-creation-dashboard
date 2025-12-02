"use client"

import * as React from "react"
import { Earth, BriefcaseBusiness, FolderTree, User, LogOut } from "lucide-react"
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
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { useUserRole } from "@/hooks/use-user-role"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "./ui/skeleton"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { role, isLoading: isLoadingRole } = useUserRole()
  const { logout, isLoggingOut } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          {/* <Sparkles className="h-5 w-5" /> */}
          <h2 className="text-lg font-semibold">NC Creation</h2>
        </div>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="py-6 px-4" isActive={pathname === "/"}>
                  <Link href="/" className="flex items-center gap-2">
                    <Earth className="h-4 w-4" />
                    Portal
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="py-6 px-4" isActive={pathname === "/work-history"}>
                  <Link href="/work-history" className="flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4" />
                    Work History
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>TOOLS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="py-6 px-4" isActive={pathname === "/file-allocator"}>
                  <Link href="/file-allocator" className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4" />
                      File Allocator
                    </div>
                    <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      New
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full py-6 px-4 justify-start gap-2"
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
