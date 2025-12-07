"use client"

import { useEffect } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { PageHeader } from "@/components/layout/page-header"
import { SheetDataContent } from "@/components/sheet-data/sheet-data-content"

export default function SheetDataPage() {
  useEffect(() => {
    document.title = "Sheet Data | NC Creation"
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
          <PageHeader
            title="Sheet Data"
            description="View and manage sheet data records"
          />
          <SheetDataContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
