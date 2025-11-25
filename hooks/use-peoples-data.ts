"use client"

import { useState, useMemo } from "react"
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

type DateFilter = "today" | "yesterday" | "all"

export function useFilteredPeopleData() {
  const { data: response, isLoading, error, refetch, isRefetching } = usePeopleData()
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

