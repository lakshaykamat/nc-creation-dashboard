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

    // Send request immediately - no delays, no batching
    const payload = JSON.stringify({
      pathname,
      userRole: roleRef.current,
    })

    // Always use fetch for reliability - sendBeacon can be unreliable
    fetch("/api/analytics/page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: payload,
      // Don't wait for response - fire and forget
    }).catch(() => {
      // Silently fail - analytics shouldn't break the app
    })
  }, [pathname]) // Only depend on pathname, not role
}

