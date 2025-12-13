/**
 * Page View Tracker Component
 * 
 * Tracks page views automatically on route changes
 * 
 * @module components/layout/page-view-tracker
 */

"use client"

import { usePageViewTracker } from "@/hooks/analytics/use-page-view-tracker"

/**
 * Component that tracks page views
 * Should be included in the root layout
 */
export function PageViewTracker() {
  usePageViewTracker()
  return null
}

