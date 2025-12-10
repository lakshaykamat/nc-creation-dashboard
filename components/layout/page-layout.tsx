/**
 * Page Layout Component
 * 
 * Shared layout wrapper that includes SidebarProvider and AppSidebar
 * Used by all pages to avoid repeating sidebar setup
 * 
 * @module components/layout/page-layout
 */

"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

