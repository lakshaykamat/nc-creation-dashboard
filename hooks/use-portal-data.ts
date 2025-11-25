"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

export type PortalData = {
  articleId: string
  doneBy: string | null
  src: string
  client: string
  journal: string
  msp: string | number
  status: string
  assignDate: string
  dueDate: string
  priority: string
  isInQA?: boolean
}

export type PortalDataError = {
  code?: number
  message: string
  hint?: string
}

export type PortalDataResponse = {
  data: PortalData[]
  message?: string
  html?: string
}

async function fetchPortalData(): Promise<PortalDataResponse> {
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

  // Handle new response format: array with objects containing html and data
  if (Array.isArray(data) && data.length > 0) {
    // Check if first item has html and data properties
    const firstItem = data[0]
    if (
      firstItem &&
      typeof firstItem === "object" &&
      "html" in firstItem &&
      "data" in firstItem
    ) {
      const html = (firstItem as { html?: string }).html
      const itemData = (firstItem as { data?: unknown[] }).data

      // Extract portal data from the data array
      const validData =
        Array.isArray(itemData)
          ? itemData.filter(
              (item): item is PortalData =>
                typeof item === "object" &&
                item !== null &&
                "articleId" in item
            )
          : []

      return {
        data: validData,
        html: html,
      }
    }

    // Check if array contains message-only objects (like "Portal has zero articles")
    if (
      data.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "message" in item &&
          !("articleId" in item)
      )
    ) {
      // Extract the message from the first item
      const message = (data[0] as { message?: string })?.message
      return {
        data: [],
        message: message || "No articles available",
      }
    }

    // Filter out any message-only objects and return only valid portal data
    const validData = data.filter(
      (item): item is PortalData =>
        typeof item === "object" &&
        item !== null &&
        "articleId" in item
    )

    return { data: validData }
  }

  // If not an array, throw error
  throw {
    code: res.status,
    message: "Invalid response format: expected an array",
  } as PortalDataError
}

export function usePortalData() {
  return useQuery({
    queryKey: ["portal-data"],
    queryFn: fetchPortalData,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

export function useFilteredPortalData() {
  const { data: response, isLoading, error, refetch, isRefetching } = usePortalData()
  const [showTexRows, setShowTexRows] = useState(false)
  const [showQARows, setShowQARows] = useState(false)
  
  // Extract data, message, and html from response
  const data = response?.data || []
  const message = response?.message
  const html = response?.html

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
    html,
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

