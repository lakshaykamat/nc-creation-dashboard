/**
 * Tracks page views in real-time for all pages.
 * Uses sendBeacon to survive page navigation (critical for login page redirects).
 * 
 * @module hooks/analytics/use-page-view-tracker
 */

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useUserRole } from "@/hooks/auth/use-user-role"

/**
 * Tracks page views automatically when pathname or query params change.
 * Includes full URL with query parameters and route params.
 * Prevents duplicate tracking and handles page navigation gracefully.
 */
export function usePageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { role } = useUserRole()
  const trackedUrlRef = useRef<string | null>(null)
  const roleRef = useRef<string>("unknown")

  useEffect(() => {
    roleRef.current = role || "unknown"
  }, [role])

  useEffect(() => {
    if (!pathname) {
      return
    }

    const queryString = searchParams.toString()
    const fullUrl = queryString ? `${pathname}?${queryString}` : pathname

    if (fullUrl === trackedUrlRef.current) {
      return
    }

    trackedUrlRef.current = fullUrl

    const payload = JSON.stringify({
      pathname,
      url: fullUrl,
      queryParams: queryString ? Object.fromEntries(searchParams.entries()) : {},
      userRole: roleRef.current,
    })

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" })
      if (navigator.sendBeacon("/api/analytics/page-view", blob)) {
        return
      }
    }

    fetch("/api/analytics/page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: payload,
      keepalive: true,
    }).catch(() => {})
  }, [pathname, searchParams])
}

