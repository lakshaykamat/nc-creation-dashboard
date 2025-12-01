"use client"

import { useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { PageHeader } from "@/components/page-header"
import { FileAllocatorContent } from "@/components/file-allocator-content"

export default function FileAllocatorPage() {
  useEffect(() => {
    document.title = "File Allocator | NC Creation"
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
          <PageHeader
            title="File Allocator"
            description="Allocate and manage files efficiently"
          />
          <FileAllocatorContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

