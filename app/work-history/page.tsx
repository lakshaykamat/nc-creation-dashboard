"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { PeopleDataContentWithChart } from "@/components/people-data-content"

export default function LastTwoDaysFilesPage() {
  const [globalFilter, setGlobalFilter] = useState("")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Work History</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
          <PeopleDataContentWithChart
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

