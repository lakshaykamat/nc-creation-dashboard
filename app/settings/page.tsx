"use client"

import { useEffect } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { PageHeader } from "@/components/layout/page-header"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
  useEffect(() => {
    document.title = "Settings | NC Creation"
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
          <PageHeader
            title="Settings"
            description="Manage your preferences and application settings"
          />
          <SettingsContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

