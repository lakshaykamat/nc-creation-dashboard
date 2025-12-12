/**
 * Hook for fetching recently allocated articles
 * 
 * @module hooks/emails/use-recently-allocated-articles
 */

import { useQuery } from "@tanstack/react-query"
import { getApiHeaders } from "@/lib/api/api-client"
import type { LastTwoDaysFileData } from "@/types/portal-data"

async function fetchRecentlyAllocatedArticles(): Promise<LastTwoDaysFileData[]> {
    const res = await fetch("/api/articles/recently-allocated", {
    method: "GET",
    headers: getApiHeaders(),
    cache: "no-store",
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch recently allocated articles")
  }

  const data = await res.json()
  return Array.isArray(data) ? data : []
}

/**
 * Fetches recently allocated articles for checking allocation status
 * 
 * @returns React Query result with recently allocated articles data
 */
export function useRecentlyAllocatedArticles() {
  return useQuery({
    queryKey: ["recently-allocated-articles"],
    queryFn: fetchRecentlyAllocatedArticles,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  })
}

