"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import type {
  PortalData,
  PortalDataError,
  PortalDataResponse,
} from "@/types/portal-data"

// Re-export for backward compatibility
export type { PortalData, PortalDataError, PortalDataResponse }

async function fetchPortalData(): Promise<PortalDataResponse> {
  const res = await fetch("/api/portal-data", {
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
    } as PortalDataError
  }

  // Check if response is an error object (has code and message properties)
  if (
    data &&
    typeof data === "object" &&
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

  // Handle response with data property
  if (data && typeof data === "object" && "data" in data) {
    const responseData = data as { data: unknown[] }
    const validData = Array.isArray(responseData.data)
      ? responseData.data.filter(
              (item): item is PortalData =>
                typeof item === "object" &&
                item !== null &&
                "articleId" in item
            )
          : []

      return {
        data: validData,
      }
    }

  // If no data property, return empty array
      return {
        data: [],
    message: "No data available",
      }
}

export function usePortalData() {
  return useQuery({
    queryKey: ["portal-data"],
    queryFn: fetchPortalData,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    gcTime: 0,
    staleTime: 0,
    retry: 1,
  })
}

export function useFilteredPortalData() {
  const { data: response, isLoading, error, refetch, isRefetching } = usePortalData()
  const [showTexRows, setShowTexRows] = useState(false)
  const [showQARows, setShowQARows] = useState(false)
  
  // Extract data and message from response
  const data = response?.data || []
  const message = response?.message

  // Filter out TEX rows by default (when showTexRows is false)
  // Filter out QA rows by default (when showQARows is false)
  const filteredData = useMemo(() => {
    let result = data
    
    // Filter TEX rows
    if (!showTexRows) {
      result = result.filter((item: PortalData) => item.src !== "TEX")
    }
    
    // Filter QA rows (hide rows where isInQA is true when showQARows is false)
    if (!showQARows) {
      result = result.filter((item: PortalData) => item.isInQA !== true)
    }
    
    return result
  }, [data, showTexRows, showQARows])

  // Check if there are any TEX or QA rows in the data
  const hasTexRows = useMemo(() => {
    return data.some((item: PortalData) => item.src === "TEX")
  }, [data])

  const hasQARows = useMemo(() => {
    return data.some((item: PortalData) => item.isInQA === true)
  }, [data])

  // Count TEX and QA rows
  const texRowCount = useMemo(() => {
    return data.filter((item: PortalData) => item.src === "TEX").length
  }, [data])

  const qaRowCount = useMemo(() => {
    return data.filter((item: PortalData) => item.isInQA === true).length
  }, [data])

  return {
    data: filteredData,
    allData: data,
    message,
    isLoading,
    error,
    showTexRows,
    setShowTexRows,
    showQARows,
    setShowQARows,
    hasTexRows,
    hasQARows,
    texRowCount,
    qaRowCount,
    refetch,
    isRefetching,
  }
}

