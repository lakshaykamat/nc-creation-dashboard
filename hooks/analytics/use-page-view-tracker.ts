/**
 * Page View Tracker Hook
 * 
 * Tracks page views in real-time for ALL pages
 * 
 * @module hooks/analytics/use-page-view-tracker
 */

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useUserRole } from "@/hooks/auth/use-user-role"

/**
 * Hook to track page views for all pages in real-time
 */
export function usePageViewTracker() {
  const pathname = usePathname()
  const { role } = useUserRole()
  const trackedPathnameRef = useRef<string | null>(null)
  const roleRef = useRef<string>("unknown")

  // Keep role ref updated (don't trigger tracking on role change)
  useEffect(() => {
    roleRef.current = role || "unknown"
  }, [role])

  // Track only on pathname change
  useEffect(() => {
    // Skip if no pathname or already tracked this pathname
    if (!pathname || pathname === trackedPathnameRef.current) {
      return
    }

    // Mark as tracked immediately to prevent duplicates
    trackedPathnameRef.current = pathname

    // Send request immediately using sendBeacon (designed for analytics, no batching)
    const payload = JSON.stringify({
      pathname,
      userRole: roleRef.current,
    })

    // Try sendBeacon first (most reliable, no batching)
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" })
      if (navigator.sendBeacon("/api/analytics/page-view", blob)) {
        return // Successfully sent
      }
    }

    // Fallback to fetch (synchronous, no delays)
    fetch("/api/analytics/page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: payload,
    }).catch(() => {
      // Silently fail - analytics shouldn't break the app
    })
  }, [pathname]) // Only depend on pathname, not role
}

