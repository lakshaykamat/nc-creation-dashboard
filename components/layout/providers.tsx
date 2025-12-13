"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { PWALinkHandler } from "./pwa-link-handler"
import { PageViewTracker } from "./page-view-tracker"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            gcTime: 0,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <PWALinkHandler />
      <PageViewTracker />
      {children}
    </QueryClientProvider>
  )
}

