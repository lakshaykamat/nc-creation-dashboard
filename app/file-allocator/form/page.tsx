"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { PageHeader } from "@/components/page-header"
import { FileAllocatorForm } from "@/components/file-allocator-form"
import { useUserRole } from "@/hooks/use-user-role"
import { Skeleton } from "@/components/ui/skeleton"
import { canAccessPage } from "@/lib/page-permissions"

export default function FileAllocatorFormPage() {
  const router = useRouter()
  const { role, isLoading } = useUserRole()

  useEffect(() => {
    document.title = "File Allocator Form | NC Creation"
  }, [])

  useEffect(() => {
    if (!isLoading && !canAccessPage("/file-allocator/form", role)) {
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

  if (!canAccessPage("/file-allocator/form", role)) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
          <PageHeader
            title="File Allocator Form"
            description="Create and manage file allocations"
          />
          <FileAllocatorForm />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

