"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/layout/page-layout"
import { PageHeader } from "@/components/layout/page-header"
import { TeamsContent } from "@/components/teams"
import { useUserRole } from "@/hooks/auth/use-user-role"
import { Skeleton } from "@/components/ui/skeleton"
import { canAccessPage } from "@/lib/common/page-permissions"

export default function TeamsPage() {
  const router = useRouter()
  const { role, isLoading } = useUserRole()

  useEffect(() => {
    document.title = "Teams | NC Creation"
  }, [])

  useEffect(() => {
    if (!isLoading && !canAccessPage("/teams", role)) {
      router.push("/")
    }
  }, [role, isLoading, router])

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageLayout>
    )
  }

  if (!canAccessPage("/teams", role)) {
    return null
  }

  return (
    <PageLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
        <PageHeader title="Teams" />
        <TeamsContent />
      </div>
    </PageLayout>
  )
}

