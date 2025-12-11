/**
 * Allocation Actions Component
 * 
 * Button to navigate to allocation form
 * 
 * @module components/file-allocator/allocation-actions
 */

"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { compressToBase64 } from "@/lib/common/compress-utils"

interface AllocationActionsProps {
  articles: string[]
  showComingSoon: boolean
}

export function AllocationActions({ articles, showComingSoon }: AllocationActionsProps) {
  const router = useRouter()

  if (articles.length === 0) {
    return null
  }

  return (
    <div className={`flex justify-center ${showComingSoon ? "opacity-30 pointer-events-none" : ""}`}>
      <Button
        size="lg"
        className="h-12 px-8 text-base font-semibold"
        onClick={() => {
          // Compress and encode newArticlesWithPages array using LZ-String
          const jsonString = JSON.stringify(articles)
          const compressedData = compressToBase64(jsonString)
          router.push(`/file-allocator/form?data=${encodeURIComponent(compressedData)}`)
        }}
      >
        Allocate New Articles
      </Button>
    </div>
  )
}

