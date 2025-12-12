/**
 * Hook for fetching last-two-days-files data
 * 
 * @module hooks/emails/use-last-two-days-files
 */

import { useQuery } from "@tanstack/react-query"
import { getApiHeaders } from "@/lib/api/api-client"
import type { LastTwoDaysFileData } from "@/types/portal-data"

async function fetchLastTwoDaysFiles(): Promise<LastTwoDaysFileData[]> {
    const res = await fetch("/api/files/recent", {
    method: "GET",
    headers: getApiHeaders(),
    cache: "no-store",
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch last two days files")
  }

  const data = await res.json()
  return Array.isArray(data) ? data : []
}

/**
 * Fetches last two days files data for checking allocated articles
 * 
 * @returns React Query result with last two days files data
 */
export function useLastTwoDaysFiles() {
  return useQuery({
    queryKey: ["last-two-days-files"],
    queryFn: fetchLastTwoDaysFiles,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  })
}

