"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { PageHeader } from "@/components/layout/page-header"
import { SettingsContent } from "@/components/settings/settings-content"
import { useDocumentTitle } from "@/hooks/common/use-document-title"

export default function SettingsPage() {
  useDocumentTitle("Settings")

  return (
    <PageLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
        <PageHeader title="Settings" />
        <SettingsContent />
      </div>
    </PageLayout>
  )
}

