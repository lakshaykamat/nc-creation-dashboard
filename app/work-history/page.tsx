"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/layout/page-layout"
import { PeopleDataContentWithChart } from "@/components/people-data/people-data-content"
import { PageHeader } from "@/components/layout/page-header"

export default function WorkHistoryPage() {
  const [globalFilter, setGlobalFilter] = useState("")

  useEffect(() => {
    document.title = "Work History | NC Creation"
  }, [])

  return (
    <PageLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-x-hidden">
        <PageHeader title="Work History" />
        <PeopleDataContentWithChart
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>
    </PageLayout>
  )
}

