"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { PortalDataContent } from "@/components/portal-data-content"
import { PageHeader } from "@/components/page-header"

export default function Page() {
  const [globalFilter, setGlobalFilter] = useState("")

  useEffect(() => {
    document.title = "Portal | NC Creation"
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
          <PageHeader
            title="Portal"
            description="Manage and track portal data and articles"
          />
          <PortalDataContent
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
