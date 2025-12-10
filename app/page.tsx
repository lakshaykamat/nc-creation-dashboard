"use client"

import { useState } from "react"
import { PageLayout } from "@/components/layout/page-layout"
import { PortalDataContent } from "@/components/portal-data/portal-data-content"
import { PageHeader } from "@/components/layout/page-header"
import { useDocumentTitle } from "@/hooks/common/use-document-title"

export default function Page() {
  const [globalFilter, setGlobalFilter] = useState("")
  useDocumentTitle("Portal")

  return (
    <PageLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
        <PageHeader title="Portal" />
        <PortalDataContent
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>
    </PageLayout>
  )
}
