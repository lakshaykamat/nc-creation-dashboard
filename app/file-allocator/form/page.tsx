"use client"

import { useEffect, Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FileAllocatorForm } from "@/components/file-allocator-form"
import { useUserRole } from "@/hooks/use-user-role"
import { Skeleton } from "@/components/ui/skeleton"
import { canAccessPage } from "@/lib/page-permissions"
import { decompressFromBase64 } from "@/lib/compress-utils"
function FileAllocatorFormContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { role, isLoading } = useUserRole()

  useEffect(() => {
    document.title = "Article Allocator Form | NC Creation"
  }, [])

  useEffect(() => {
    if (!isLoading && !canAccessPage("/file-allocator/form", role)) {
      router.push("/")
    }
  }, [role, isLoading, router])

  // Parse newArticlesWithPages array from query params
  const [newArticlesWithPages, setNewArticlesWithPages] = useState<string[] | null>(null)
  const dataParam = searchParams.get("data")
  
  useEffect(() => {
    if (dataParam) {
      try {
        const decodedData = decompressFromBase64(decodeURIComponent(dataParam))
        setNewArticlesWithPages(JSON.parse(decodedData) as string[])
      } catch (error) {
        console.error("Failed to parse newArticlesWithPages from query params:", error)
      }
    }
  }, [dataParam])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!canAccessPage("/file-allocator/form", role)) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <FileAllocatorForm newArticlesWithPages={newArticlesWithPages} />
    </div>
  )
}

export default function FileAllocatorFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    }>
      <FileAllocatorFormContent />
    </Suspense>
  )
}

