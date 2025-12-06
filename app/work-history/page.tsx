"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { PeopleDataContentWithChart } from "@/components/people-data/people-data-content"
import { PageHeader } from "@/components/layout/page-header"

export default function WorkHistoryPage() {
  const [globalFilter, setGlobalFilter] = useState("")

  useEffect(() => {
    document.title = "Work History | NC Creation"
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
          <PageHeader
            title="Work History"
            description="View completed work and track productivity by person and date"
          />
          <PeopleDataContentWithChart
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

