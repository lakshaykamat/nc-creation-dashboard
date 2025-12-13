/**
 * Hook for fetching recent allocations
 * 
 * @module hooks/analytics/use-recent-allocations
 */

import { useQuery } from "@tanstack/react-query"
import { getApiHeaders } from "@/lib/api/api-client"
import type { AllocationLog } from "@/components/analytics/recent-allocations-table"

export interface AllocationLogsResponse {
  logs: AllocationLog[]
  totalCount: number
}

async function fetchRecentAllocations(): Promise<AllocationLogsResponse> {
  const params = new URLSearchParams({ 
    domain: "article allocator",
    limit: "25"
  })
  const response = await fetch(`/api/analytics/logs?${params.toString()}`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to fetch allocations" }))
    throw new Error(error.message || "Failed to fetch allocations")
  }

  return response.json()
}

export function useRecentAllocations() {
  return useQuery<AllocationLogsResponse>({
    queryKey: ["analytics-allocations"],
    queryFn: fetchRecentAllocations,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

