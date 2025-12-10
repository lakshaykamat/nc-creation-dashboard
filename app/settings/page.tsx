"use client"

import { useEffect } from "react"
import { PageLayout } from "@/components/layout/page-layout"
import { PageHeader } from "@/components/layout/page-header"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
  useEffect(() => {
    document.title = "Settings | NC Creation"
  }, [])

  return (
    <PageLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
        <PageHeader title="Settings" />
        <SettingsContent />
      </div>
    </PageLayout>
  )
}

