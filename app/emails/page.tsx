"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/layout/page-layout"
import { PageHeader } from "@/components/layout/page-header"
import { EmailsContent } from "@/components/emails"
import { useUserRole } from "@/hooks/auth/use-user-role"
import { useDocumentTitle } from "@/hooks/common/use-document-title"
import { useIsMobile } from "@/hooks/common/use-mobile"
import { Skeleton } from "@/components/ui/skeleton"
import { canAccessPage } from "@/lib/common/page-permissions"

export default function EmailsPage() {
  const router = useRouter()
  const { role, isLoading } = useUserRole()
  const isMobile = useIsMobile()
  const [isViewingEmail, setIsViewingEmail] = useState(false)
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
      <div className={`flex flex-col flex-1 overflow-hidden min-h-0 h-full w-full ${isMobile && isViewingEmail ? '' : 'p-4 sm:p-6'}`}>
        <div className={`shrink-0 ${isMobile && isViewingEmail ? 'relative z-[60] bg-background px-4 pt-4' : ''}`}>
          <PageHeader title="Emails" />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden w-full">
          <EmailsContent onViewingEmailChange={setIsViewingEmail} />
        </div>
      </div>
    </PageLayout>
  )
}

