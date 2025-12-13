/**
 * Tracks page views in real-time for all pages.
 * Uses sendBeacon to survive page navigation (critical for login page redirects).
 * 
 * @module hooks/analytics/use-page-view-tracker
 */

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useUserRole } from "@/hooks/auth/use-user-role"

/**
 * Tracks page views automatically when pathname changes.
 * Prevents duplicate tracking and handles page navigation gracefully.
 */
export function usePageViewTracker() {
  const pathname = usePathname()
  const { role } = useUserRole()
  const trackedPathnameRef = useRef<string | null>(null)
  const roleRef = useRef<string>("unknown")

  useEffect(() => {
    roleRef.current = role || "unknown"
  }, [role])

  useEffect(() => {
    if (!pathname || pathname === trackedPathnameRef.current) {
      return
    }

    trackedPathnameRef.current = pathname

    const payload = JSON.stringify({
      pathname,
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
  }, [pathname])
}

