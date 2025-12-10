/**
 * React Query hooks for Teams CRUD operations
 * 
 * @module hooks/teams/use-teams
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  TeamMember,
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
  TeamMembersResponse,
  TeamMemberResponse,
} from "@/types/teams"

const QUERY_KEY = ["teams"]

/**
 * Fetch all team members
 */
async function fetchTeams(): Promise<TeamMember[]> {
  const res = await fetch("/api/teams", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const error: TeamMembersResponse = await res.json()
    throw new Error(error.error || "Failed to fetch team members")
  }

  const data: TeamMembersResponse = await res.json()
  return data.data || []
}

/**
 * Create a new team member
 */
async function createTeam(request: CreateTeamMemberRequest): Promise<TeamMember> {
  const res = await fetch("/api/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const error: TeamMemberResponse = await res.json()
    throw new Error(error.error || "Failed to create team member")
  }

  const data: TeamMemberResponse = await res.json()
  if (!data.data) {
    throw new Error("No data returned from create operation")
  }
  return data.data
}

/**
 * Update a team member
 */
async function updateTeam(
  id: string,
  request: UpdateTeamMemberRequest
): Promise<TeamMember> {
  const res = await fetch(`/api/teams/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const error: TeamMemberResponse = await res.json()
    throw new Error(error.error || "Failed to update team member")
  }

  const data: TeamMemberResponse = await res.json()
  if (!data.data) {
    throw new Error("No data returned from update operation")
  }
  return data.data
}

/**
 * Delete a team member
 */
async function deleteTeam(id: string): Promise<void> {
  const res = await fetch(`/api/teams/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const error: TeamMemberResponse = await res.json()
    throw new Error(error.error || "Failed to delete team member")
  }
}

/**
 * Hook to fetch all team members
 */
export function useTeams() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchTeams,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
    gcTime: 0,
  })
}

/**
 * Hook to create a new team member
 */
export function useCreateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Hook to update a team member
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamMemberRequest }) =>
      updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

/**
 * Hook to delete a team member
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

