"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { PageHeader } from "@/components/layout/page-header"
import { FileAllocatorContent } from "@/components/file-allocator/file-allocator-content"
import { useUserRole } from "@/hooks/auth/use-user-role"
import { Skeleton } from "@/components/ui/skeleton"
import { canAccessPage } from "@/lib/common/page-permissions"

export default function FileAllocatorPage() {
  const router = useRouter()
  const { role, isLoading } = useUserRole()

  useEffect(() => {
    document.title = "File Allocator | NC Creation"
  }, [])

  useEffect(() => {
    if (!isLoading && !canAccessPage("/file-allocator", role)) {
      router.push("/")
    }
  }, [role, isLoading, router])

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden">
          <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!canAccessPage("/file-allocator", role)) {
    return null
  }

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

