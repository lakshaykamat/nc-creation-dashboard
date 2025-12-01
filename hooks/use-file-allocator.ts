"use client"

import { useQuery } from "@tanstack/react-query"

export interface DetectArticlesResponse {
  existingSheetArticles: string[]
  emailArticles: string[]
  newArticleIds: string[]
  totalNewArticles: number
  newArticlesWithPages: string[]
  totalNewPages: number
  html: string
  emailDate: string
}

export type FileAllocatorError = {
  code?: number
  message: string
  hint?: string
}

async function fetchFileAllocatorData(): Promise<DetectArticlesResponse> {
  const apiKey = process.env.NEXT_PUBLIC_NC_API_KEY

  if (!apiKey) {
    throw {
      code: 500,
      message: "API key not configured",
    } as FileAllocatorError
  }

  const res = await fetch(
    "https://n8n-ex6e.onrender.com/webhook/lastest-allocation",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
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

export function useFileAllocator() {
  return useQuery({
    queryKey: ["file-allocator"],
    queryFn: fetchFileAllocatorData,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    gcTime: 0,
    staleTime: 0,
    retry: 1,
  })
}

