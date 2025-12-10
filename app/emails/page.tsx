"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/layout/page-layout"
import { PageHeader } from "@/components/layout/page-header"
import { EmailsContent } from "@/components/emails"
import { useUserRole } from "@/hooks/auth/use-user-role"
import { useDocumentTitle } from "@/hooks/common/use-document-title"
import { Skeleton } from "@/components/ui/skeleton"
import { canAccessPage } from "@/lib/common/page-permissions"

export default function EmailsPage() {
  const router = useRouter()
  const { role, isLoading } = useUserRole()
  useDocumentTitle("Emails")

  useEffect(() => {
    if (!isLoading && !canAccessPage("/emails", role)) {
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

  if (!canAccessPage("/emails", role)) {
    return null
  }

  return (
    <PageLayout>
      <div className="flex flex-col flex-1 p-4 sm:p-6 overflow-hidden min-h-0">
        <div className="shrink-0">
          <PageHeader title="Emails" />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <EmailsContent />
        </div>
      </div>
    </PageLayout>
  )
}

