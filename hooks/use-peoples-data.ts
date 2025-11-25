"use client"

import { useQuery } from "@tanstack/react-query"

export type PeopleData = {
  row_number: number
  Month: string
  Date: string
  "Article number": string
  Pages: number
  Completed: string
  "Done by": string
  Time: string
}

export type PeopleDataError = {
  code?: number
  message: string
  hint?: string
}

export type PeopleDataResponse = {
  data: PeopleData[]
  message?: string
}

async function fetchPeopleData(): Promise<PeopleDataResponse> {
  const res = await fetch(
    "https://n8n-ex6e.onrender.com/webhook/peoples",
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
    } as PeopleDataError
  }

  // Check if response is an error object (has code and message properties)
  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "code" in data &&
    "message" in data
  ) {
    const error: PeopleDataError = {
      code: data.code || res.status,
      message: data.message || "Failed to fetch people data",
      hint: data.hint,
    }
    throw error
  }

  // Check if response status is not OK
  if (!res.ok) {
    const error: PeopleDataError = {
      code: (data as PeopleDataError)?.code || res.status,
      message: (data as PeopleDataError)?.message || "Failed to fetch people data",
      hint: (data as PeopleDataError)?.hint,
    }
    throw error
  }

  // Handle array response
  if (Array.isArray(data)) {
    // Filter out any message-only objects and return only valid people data
    const validData = data.filter(
      (item): item is PeopleData =>
        typeof item === "object" &&
        item !== null &&
        "Article number" in item
    )

    return { data: validData }
  }

  // If not an array, throw error
  throw {
    code: res.status,
    message: "Invalid response format: expected an array",
  } as PeopleDataError
}

export function usePeopleData() {
  return useQuery({
    queryKey: ["people-data"],
    queryFn: fetchPeopleData,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

