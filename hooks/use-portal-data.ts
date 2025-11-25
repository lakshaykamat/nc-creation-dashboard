"use client"

import { useQuery } from "@tanstack/react-query"

export type PortalData = {
  articleId: string
  doneBy: string | null
}

export type PortalDataError = {
  code?: number
  message: string
  hint?: string
}

async function fetchPortalData(): Promise<PortalData[]> {
  const res = await fetch(
    "https://n8n-ex6e.onrender.com/webhook/get-portal-data",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
      credentials: "omit",
    }
  )

  let data
  try {
    data = await res.json()
  } catch (e) {
    throw {
      code: res.status,
      message: "Failed to parse response",
    } as PortalDataError
  }

  // Check if response is an error object (has code and message properties)
  // This handles cases where API returns error object even with 200 status
  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "code" in data &&
    "message" in data
  ) {
    const error: PortalDataError = {
      code: data.code || res.status,
      message: data.message || "Failed to fetch portal data",
      hint: data.hint,
    }
    throw error
  }

  // Check if response status is not OK
  if (!res.ok) {
    const error: PortalDataError = {
      code: (data as PortalDataError)?.code || res.status,
      message: (data as PortalDataError)?.message || "Failed to fetch portal data",
      hint: (data as PortalDataError)?.hint,
    }
    throw error
  }

  // Ensure we have an array
  if (!Array.isArray(data)) {
    throw {
      code: res.status,
      message: "Invalid response format: expected an array",
    } as PortalDataError
  }

  return data as PortalData[]
}

export function usePortalData() {
  return useQuery({
    queryKey: ["portal-data"],
    queryFn: fetchPortalData,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
