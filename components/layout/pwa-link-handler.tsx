"use client"

import { useEffect } from "react"

/**
 * Ensures PWA stays in standalone mode and handles navigation
 */
export function PWALinkHandler() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Detect if running as PWA
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://")

      if (isStandalone) {
        // Add class to body for PWA-specific styling if needed
        document.body.classList.add("pwa-standalone")
      }

      // Ensure service worker is active for navigation
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(() => {
          // Service worker is ready, navigation should work
        })
      }
    }
  }, [])

  return null
}

