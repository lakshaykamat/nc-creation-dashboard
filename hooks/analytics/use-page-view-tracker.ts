/**
 * Page View Tracker Hook
 * 
 * Tracks page views and visitor analytics
 * 
 * @module hooks/analytics/use-page-view-tracker
 */

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useUserRole } from "@/hooks/auth/use-user-role"

/**
 * Hook to track page views
 * 
 * Automatically logs page views when the pathname changes
 */
export function usePageViewTracker() {
  const pathname = usePathname()
  const { role } = useUserRole()

  useEffect(() => {
    // Skip tracking for login page
    if (pathname === "/login") {
      return
    }

    // Track page view after page load (non-blocking)
    // Use requestIdleCallback if available, otherwise setTimeout to defer
    const trackPageView = () => {
      try {
        // Use fetch with keepalive or just fire-and-forget
        fetch("/api/analytics/page-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            pathname,
            userRole: role || "unknown",
          }),
          // Don't wait for response - fire and forget
          keepalive: true,
        }).catch(() => {
          // Silently fail - we don't want to break the app if analytics fails
        })
      } catch (error) {
        // Silently fail - we don't want to break the app if analytics fails
      }
    }

    // Defer tracking to after page render/load
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        // Use requestIdleCallback if available to run when browser is idle
        ;(window as any).requestIdleCallback(trackPageView, { timeout: 2000 })
      } else {
        // Fallback: use setTimeout to defer execution after render
        setTimeout(trackPageView, 0)
      }
    }
  }, [pathname, role])
}

