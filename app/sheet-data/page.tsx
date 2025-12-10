"use client"

import { useEffect } from "react"
import { PageLayout } from "@/components/layout/page-layout"
import { PageHeader } from "@/components/layout/page-header"
import { SheetDataContent } from "@/components/sheet-data/sheet-data-content"

export default function SheetDataPage() {
  useEffect(() => {
    document.title = "Sheet Data | NC Creation"
  }, [])

  return (
    <PageLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
        <PageHeader title="Sheet Data" />
        <SheetDataContent />
      </div>
    </PageLayout>
  )
}
