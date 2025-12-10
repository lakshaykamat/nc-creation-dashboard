/**
 * React Query hook for fetching emails
 * 
 * @module hooks/emails/use-emails
 */

import { useQuery } from "@tanstack/react-query"
import type { Email, EmailsResponse } from "@/types/emails"

const QUERY_KEY = ["emails"]

/**
 * Fetch emails from API
 */
async function fetchEmails(): Promise<Email[]> {
  const res = await fetch("/api/emails", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to fetch emails")
  }

  const data = await res.json()
  return data.data || []
}

/**
 * Hook to fetch emails
 */
export function useEmails() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchEmails,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  })
}

