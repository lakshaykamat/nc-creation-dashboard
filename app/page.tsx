"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { PortalDataContent } from "@/components/portal-data-content"
import { usePortalData } from "@/hooks/use-portal-data"

export default function Page() {
  const { refetch, isRefetching } = usePortalData()
  const [globalFilter, setGlobalFilter] = useState("")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-lg font-semibold">Portal Sheet</h1>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          <PortalDataContent
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            refetch={refetch}
            isRefetching={isRefetching}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
