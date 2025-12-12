"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import type {
  LastTwoDaysFileData,
  LastTwoDaysFileDataError,
  LastTwoDaysFileDataResponse,
} from "@/types/portal-data"

// Re-export for backward compatibility
export type {
  LastTwoDaysFileData,
  LastTwoDaysFileDataError,
  LastTwoDaysFileDataResponse,
}

async function fetchLastTwoDaysFilesData(): Promise<LastTwoDaysFileDataResponse> {
  const res = await fetch("/api/last-two-days-files", {
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
    } as LastTwoDaysFileDataError
  }

  // Check if response is an error object (has code and message properties)
  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "code" in data &&
    "message" in data
  ) {
    const error: LastTwoDaysFileDataError = {
      code: data.code || res.status,
      message: data.message || "Failed to fetch last two days files data",
      hint: data.hint,
    }
    throw error
  }

  // Check if response status is not OK
  if (!res.ok) {
    const error: LastTwoDaysFileDataError = {
      code: (data as LastTwoDaysFileDataError)?.code || res.status,
      message: (data as LastTwoDaysFileDataError)?.message || "Failed to fetch last two days files data",
      hint: (data as LastTwoDaysFileDataError)?.hint,
    }
    throw error
  }

  // Handle array response
  if (Array.isArray(data)) {
    // Filter out any message-only objects and return only valid last two days files data
    const validData = data.filter(
      (item): item is LastTwoDaysFileData =>
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
  } as LastTwoDaysFileDataError
}

/**
 * Fetches last two days files data from API endpoint
 * 
 * Retrieves allocation data for articles processed in the last two days.
 * Used to determine which articles are already allocated. Configured to
 * always fetch fresh data with no caching.
 * 
 * @returns React Query result with last two days files data array
 */
export function useLastTwoDaysFilesData() {
  return useQuery({
    queryKey: ["last-two-days-files-data"],
    queryFn: fetchLastTwoDaysFilesData,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    gcTime: 0,
    staleTime: 0,
    retry: 1,
  })
}

type DateFilter = "today" | "yesterday" | "all"

/**
 * Fetches and filters last two days files by date with grouping
 * 
 * Extends useLastTwoDaysFilesData with date filtering (today/yesterday/all)
 * and grouping by "Done by" person. Groups are case-insensitive and trimmed,
 * preserving original name formatting for display. Date filtering uses
 * DD/MM/YYYY format matching the data structure.
 * 
 * @returns Object containing:
 *   - data: Filtered data by selected date (today/yesterday/all)
 *   - allData: Unfiltered data from API
 *   - groupedByPerson: Data grouped by person name (case-insensitive keys)
 *   - dateFilter: Current date filter selection
 *   - setDateFilter: Function to change date filter
 *   - isLoading, error, refetch, isRefetching: Query state from useLastTwoDaysFilesData
 */
export function useFilteredLastTwoDaysFilesData() {
  const { data: response, isLoading, error, refetch, isRefetching } = useLastTwoDaysFilesData()
  const [dateFilter, setDateFilter] = useState<DateFilter>("today")

  const allData = response?.data || []
  const message = response?.message

  // Filter data by date
  const filteredByDate = useMemo(() => {
    if (dateFilter === "all") return allData

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }

    const targetDate = dateFilter === "today" ? formatDate(today) : formatDate(yesterday)

    return allData.filter((item) => item.Date === targetDate)
  }, [allData, dateFilter])

  // Group data by "Done by" (case-insensitive, trimmed)
  const groupedByPerson = useMemo(() => {
    const grouped: Record<string, typeof filteredByDate> = {}
    const nameMap: Record<string, string> = {} // Maps normalized name to original name
    
    filteredByDate.forEach((item) => {
      const originalName = item["Done by"] || "Unknown"
      const normalizedName = originalName.trim().toLowerCase() || "unknown"
      
      // Use the first occurrence's original name as the display name
      if (!nameMap[normalizedName]) {
        nameMap[normalizedName] = originalName.trim() || "Unknown"
      }
      
      if (!grouped[normalizedName]) {
        grouped[normalizedName] = []
      }
      grouped[normalizedName].push(item)
    })
    
    // Convert to use original names as keys
    const result: Record<string, typeof filteredByDate> = {}
    Object.entries(grouped).forEach(([normalizedKey, items]) => {
      result[nameMap[normalizedKey]] = items
    })
    
    return result
  }, [filteredByDate])

  return {
    data: filteredByDate,
    allData,
    message,
    isLoading,
    error,
    dateFilter,
    setDateFilter,
    groupedByPerson,
    refetch,
    isRefetching,
  }
}

