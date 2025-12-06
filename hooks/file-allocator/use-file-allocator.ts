"use client"

import { useQuery } from "@tanstack/react-query"

import type { DetectArticlesResponse, FileAllocatorError } from "@/types/file-allocator"

// Re-export for backward compatibility
export type { DetectArticlesResponse, FileAllocatorError }

async function fetchFileAllocatorData(
  recent?: boolean,
  index?: number
): Promise<DetectArticlesResponse> {
  const urlParams = new URLSearchParams()
  if (recent) {
    urlParams.append("recent", "1")
  } else if (index !== undefined) {
    // Convert index to recent parameter: index 1 = recent 2, index 2 = recent 3, etc.
    urlParams.append("recent", (index + 1).toString())
  }

  const url = `/api/file-allocator${urlParams.toString() ? `?${urlParams.toString()}` : ""}`

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
    credentials: "omit",
  })

  let data
  try {
    data = await res.json()
  } catch (e) {
    throw {
      code: res.status,
      message: "Failed to parse response",
    } as FileAllocatorError
  }

  // Check if response is an error object (has code and message properties)
  if (
    data &&
    typeof data === "object" &&
    "code" in data &&
    "message" in data
  ) {
    const error: FileAllocatorError = {
      code: data.code || res.status,
      message: data.message || "Failed to fetch file allocator data",
      hint: data.hint,
    }
    throw error
  }

  // Check if response status is not OK
  if (!res.ok) {
    const error: FileAllocatorError = {
      code: (data as FileAllocatorError)?.code || res.status,
      message: (data as FileAllocatorError)?.message || "Failed to fetch file allocator data",
      hint: (data as FileAllocatorError)?.hint,
    }
    throw error
  }

  // Validate and return response
  if (data && typeof data === "object") {
    return data as DetectArticlesResponse
  }

  throw {
    code: res.status,
    message: "Invalid response format",
  } as FileAllocatorError
}

export function useFileAllocator(recent?: boolean, index?: number) {
  return useQuery({
    queryKey: ["file-allocator", recent ? "recent" : index],
    queryFn: () => fetchFileAllocatorData(recent, index),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    gcTime: 0,
    staleTime: 0,
    retry: 1,
  })
}

