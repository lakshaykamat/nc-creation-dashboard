"use client"

import { useQuery } from "@tanstack/react-query"
import type { UserRole } from "@/lib/auth-utils"

interface UserRoleResponse {
  role: UserRole | null
}

async function fetchUserRole(): Promise<UserRoleResponse> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return { role: null }
  }

  return response.json()
}

export function useUserRole() {
  const { data, isLoading } = useQuery({
    queryKey: ["user-role"],
    queryFn: fetchUserRole,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    role: data?.role ?? null,
    isLoading,
  }
}

