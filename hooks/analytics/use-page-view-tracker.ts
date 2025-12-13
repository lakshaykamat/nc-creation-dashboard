/**
 * Page View Tracker Hook
 * 
 * Tracks page views and visitor analytics for ALL pages
 * 
 * This hook automatically tracks:
 * - Initial page load
 * - All route changes (including dynamic routes, nested routes, etc.)
 * - All pages except the login page
 * 
 * @module hooks/analytics/use-page-view-tracker
 */

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useUserRole } from "@/hooks/auth/use-user-role"

/**
 * Hook to track page views for all pages
 * 
 * Automatically logs page views when the pathname changes.
 * Tracks all pages including:
 * - Root page (/)
 * - All static pages (analytics, emails, settings, teams, etc.)
 * - All dynamic routes
 * - All nested routes
 */
export function usePageViewTracker() {
  const pathname = usePathname()
  const { role } = useUserRole()
  const previousPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    // Skip tracking for login page
    if (pathname === "/login") {
      previousPathnameRef.current = pathname
      return
    }

    // Skip if pathname hasn't actually changed (prevents duplicate tracking on re-renders)
    if (previousPathnameRef.current === pathname) {
      return
    }

    // Update the previous pathname
    previousPathnameRef.current = pathname

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
    // This ensures the page is fully loaded before tracking
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

