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

  // Track only on pathname change - fire immediately, don't wait for role
  useEffect(() => {
    // Skip if no pathname
    if (!pathname) {
      return
    }

    // Skip if already tracked this exact pathname (prevent duplicates on re-renders)
    if (pathname === trackedPathnameRef.current) {
      return
    }

    // Mark as tracked immediately to prevent duplicates
    trackedPathnameRef.current = pathname

    // Get role value (use current value, don't wait for it to load)
    const currentRole = role || "unknown"

    // Send request immediately - no delays, no batching
    const payload = JSON.stringify({
      pathname,
      userRole: currentRole,
    })

    // Try sendBeacon first - it's designed to survive page navigation
    // This is critical for login page which redirects immediately after tracking
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" })
      if (navigator.sendBeacon("/api/analytics/page-view", blob)) {
        return // Successfully queued, will send even if page navigates
      }
    }

    // Fallback to fetch with keepalive
    fetch("/api/analytics/page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: payload,
      keepalive: true, // Ensures request completes even if page navigates away
    }).catch(() => {
      // Silently fail - analytics shouldn't break the app
    })
  }, [pathname, role]) // Include role so we use the latest value when available
}

