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
  const roleRef = useRef<string | null>(null)
  const isMountedRef = useRef<boolean>(false)

  // Keep role ref updated
  useEffect(() => {
    roleRef.current = role || null
  }, [role])

  // Track page views - separate effect for pathname changes only
  useEffect(() => {
    // Wait for pathname to be available (should be immediate, but defensive)
    if (!pathname) {
      return
    }

    // Skip tracking for login page
    if (pathname === "/login") {
      previousPathnameRef.current = pathname
      isMountedRef.current = true
      return
    }

    // Track on initial mount or when pathname changes
    const isInitialMount = !isMountedRef.current
    const pathnameChanged = previousPathnameRef.current !== pathname

    if (!isInitialMount && !pathnameChanged) {
      return
    }

    // Update refs
    previousPathnameRef.current = pathname
    isMountedRef.current = true

    // Track page view immediately (non-blocking)
    // Send right away to prevent requests from stacking up
    const trackPageView = () => {
      try {
        // Get the current role value from ref (always latest value)
        const currentRole = roleRef.current || "unknown"
        
        // Use fetch with keepalive - sends immediately without blocking
        fetch("/api/analytics/page-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            pathname,
            userRole: currentRole,
          }),
          // Keepalive ensures request completes even if page unloads
          keepalive: true,
        }).catch(() => {
          // Silently fail - we don't want to break the app if analytics fails
        })
      } catch (error) {
        // Silently fail - we don't want to break the app if analytics fails
      }
    }

    // Send immediately - use minimal setTimeout(0) to defer to next tick
    // This is non-blocking but executes immediately, preventing request batching
    if (typeof window !== "undefined") {
      setTimeout(trackPageView, 0)
    }
    // Only depend on pathname - don't re-run when role changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
}

