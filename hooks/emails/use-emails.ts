/**
 * React Query hook for fetching emails
 * 
 * @module hooks/emails/use-emails
 */

import { useQuery } from "@tanstack/react-query"
import { getApiHeaders } from "@/lib/api/api-client"
import type { Email, EmailsResponse } from "@/types/emails"

const QUERY_KEY = ["emails"]

async function fetchEmails(): Promise<Email[]> {
  const res = await fetch("/api/emails", {
    method: "GET",
    headers: getApiHeaders(),
    cache: "no-store",
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to fetch emails")
  }

  const data = await res.json()
  const emails = data.data
  return Array.isArray(emails) ? emails : []
}

/**
 * Fetches emails from API endpoint
 * 
 * @returns React Query result with emails data, loading, and error state
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

