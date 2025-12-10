"use client"

import { useEffect, Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FileAllocatorForm } from "@/components/file-allocator/file-allocator-form"
import { useUserRole } from "@/hooks/auth/use-user-role"
import { Skeleton } from "@/components/ui/skeleton"
import { canAccessPage } from "@/lib/common/page-permissions"
import { decompressFromBase64 } from "@/lib/common/compress-utils"
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
  // Supports both LZ-string compressed and normal JSON data
  const [newArticlesWithPages, setNewArticlesWithPages] = useState<string[] | null>(null)
  const dataParam = searchParams.get("data")
  
  useEffect(() => {
    if (dataParam) {
      try {
        const decodedParam = decodeURIComponent(dataParam)
        let parsedData: string[] | null = null
        
        // Method 1: Try LZ-string decompression (compressed data)
        try {
          const decompressed = decompressFromBase64(decodedParam)
          parsedData = JSON.parse(decompressed) as string[]
        } catch {
          // Method 2: Try plain base64 decode + JSON parse (normal base64)
          try {
            const base64Decoded = atob(decodedParam)
            parsedData = JSON.parse(base64Decoded) as string[]
          } catch {
            // Method 3: Try direct JSON parse (plain JSON string)
            try {
              parsedData = JSON.parse(decodedParam) as string[]
            } catch (error) {
              console.error("Failed to parse newArticlesWithPages from query params:", error)
              parsedData = null
            }
          }
        }
        
        setNewArticlesWithPages(parsedData)
      } catch (error) {
        console.error("Failed to parse newArticlesWithPages from query params:", error)
        setNewArticlesWithPages(null)
      }
    } else {
      setNewArticlesWithPages(null)
    }
  }, [dataParam])

  // Redirect to home if form data query is empty or array is empty
  useEffect(() => {
    if (!isLoading) {
      // Redirect if no data param or if parsed data is empty array
      if (!dataParam || (newArticlesWithPages !== null && newArticlesWithPages.length === 0)) {
        router.push("/")
      }
    }
  }, [dataParam, newArticlesWithPages, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
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
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 py-4 sm:py-6">
      <FileAllocatorForm newArticlesWithPages={newArticlesWithPages} />
    </div>
  )
}

export default function FileAllocatorFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
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

