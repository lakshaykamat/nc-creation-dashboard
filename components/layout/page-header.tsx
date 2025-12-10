"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"

interface PageHeaderProps {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <SidebarTrigger />
      <h1 className="text-xl font-semibold">{title}</h1>
    </div>
  )
}

