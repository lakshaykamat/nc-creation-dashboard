/**
 * Hook to fetch team members for allocation form
 * 
 * Fetches team members from API and transforms them to PriorityField format
 * 
 * @module hooks/file-allocator/use-team-members
 */

import { useQuery } from "@tanstack/react-query"
import { getApiHeaders } from "@/lib/api/api-client"
import type { TeamMember } from "@/types/teams"
import type { PriorityField } from "@/lib/constants/file-allocator-constants"

const QUERY_KEY = ["teams"]
const STALE_TIME = 5 * 60 * 1000 // 5 minutes
const GC_TIME = 10 * 60 * 1000 // 10 minutes

/**
 * Fetch team members from API
 */
async function fetchTeamMembers(): Promise<TeamMember[]> {
  const res = await fetch("/api/teams", {
    method: "GET",
    headers: getApiHeaders(),
    cache: "no-store",
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch team members")
  }

  const data = await res.json()
  return data.data || []
}

/**
 * Return type for useTeamMembers hook
 */
export interface UseTeamMembersReturn {
  members: PriorityField[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch team members for allocation form
 * 
 * Returns team members transformed to PriorityField format.
 * Returns empty array if API fails or returns no members.
 * 
 * @returns Object with members array, isLoading, and error state
 */
export function useTeamMembers(): UseTeamMembersReturn {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchTeamMembers,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 1,
  })

  // Transform team members to PriorityField format
  const members: PriorityField[] = query.data && query.data.length > 0
    ? query.data.map((member) => ({
        id: member._id,
        label: member.name,
        value: 0,
      }))
    : []

  return {
    members,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  }
}

