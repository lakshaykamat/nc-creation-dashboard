 /**
 * Request Utilities
 * 
 * Utilities for extracting user information from Next.js requests
 * 
 * @module lib/utils/request-utils
 */

import { NextRequest } from "next/server"

/**
 * User device and browser information
 */
export interface UserDeviceInfo {
  ip: string | null
  userAgent: string | null
  browser: string | null
  browserVersion: string | null
  os: string | null
  osVersion: string | null
  device: "desktop" | "mobile" | "tablet" | "unknown"
  platform: string | null
}

/**
 * Extract client IP address from Next.js request
 * Handles various headers including X-Forwarded-For, X-Real-IP, etc.
 */
function getClientIP(request: NextRequest): string | null {
  // Check various headers for IP address
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = forwardedFor.split(",").map(ip => ip.trim())
    return ips[0] || null
  }

  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get("cf-connecting-ip") // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback to connection remote address (might not work in all environments)
  return null
}

/**
 * Parse user agent string to extract browser and OS information
 * Simple parsing without external dependencies
 */
function parseUserAgent(userAgent: string | null): Omit<UserDeviceInfo, "ip"> {
  if (!userAgent) {
    return {
      userAgent: null,
      browser: null,
      browserVersion: null,
      os: null,
      osVersion: null,
      device: "unknown",
      platform: null,
    }
  }

  let browser: string | null = null
  let browserVersion: string | null = null
  let os: string | null = null
  let osVersion: string | null = null
  let device: "desktop" | "mobile" | "tablet" | "unknown" = "unknown"
  let platform: string | null = null

  // Detect browser
  const chromeMatch = userAgent.match(/(?:Chrome|CriOS)\/(\d+)/)
  if (chromeMatch) {
    browser = "Chrome"
    browserVersion = chromeMatch[1]
  } else {
    const firefoxMatch = userAgent.match(/Firefox\/(\d+)/)
    if (firefoxMatch) {
      browser = "Firefox"
      browserVersion = firefoxMatch[1]
    } else {
      const safariMatch = userAgent.match(/Version\/(\d+).*Safari/)
      if (safariMatch) {
        browser = "Safari"
        browserVersion = safariMatch[1]
      } else {
        const edgeMatch = userAgent.match(/Edg\/(\d+)/)
        if (edgeMatch) {
          browser = "Edge"
          browserVersion = edgeMatch[1]
        } else {
          const operaMatch = userAgent.match(/OPR\/(\d+)/)
          if (operaMatch) {
            browser = "Opera"
            browserVersion = operaMatch[1]
          }
        }
      }
    }
  }

  // Detect OS
  if (userAgent.includes("Windows NT")) {
    os = "Windows"
    const winVersionMatch = userAgent.match(/Windows NT ([\d.]+)/)
    if (winVersionMatch) {
      osVersion = winVersionMatch[1]
    }
    device = "desktop"
  } else if (userAgent.includes("Mac OS X") || userAgent.includes("Macintosh")) {
    os = "macOS"
    const macVersionMatch = userAgent.match(/Mac OS X ([\d_]+)/)
    if (macVersionMatch) {
      osVersion = macVersionMatch[1].replace(/_/g, ".")
    }
    // Check if it's iOS (iPad/iPhone can identify as Mac in some cases)
    if (userAgent.includes("iPhone")) {
      os = "iOS"
      device = "mobile"
      const iosVersionMatch = userAgent.match(/OS ([\d_]+)/)
      if (iosVersionMatch) {
        osVersion = iosVersionMatch[1].replace(/_/g, ".")
      }
    } else if (userAgent.includes("iPad")) {
      os = "iOS"
      device = "tablet"
      const iosVersionMatch = userAgent.match(/OS ([\d_]+)/)
      if (iosVersionMatch) {
        osVersion = iosVersionMatch[1].replace(/_/g, ".")
      }
    } else {
      device = "desktop"
    }
  } else if (userAgent.includes("Linux")) {
    os = "Linux"
    device = "desktop"
  } else if (userAgent.includes("Android")) {
    os = "Android"
    device = "mobile"
    const androidVersionMatch = userAgent.match(/Android ([\d.]+)/)
    if (androidVersionMatch) {
      osVersion = androidVersionMatch[1]
    }
    // Check if it's a tablet
    if (userAgent.includes("Tablet")) {
      device = "tablet"
    }
  } else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS"
    const iosVersionMatch = userAgent.match(/OS ([\d_]+)/)
    if (iosVersionMatch) {
      osVersion = iosVersionMatch[1].replace(/_/g, ".")
    }
    if (userAgent.includes("iPad")) {
      device = "tablet"
    } else {
      device = "mobile"
    }
  }

  // Detect platform (for mobile/tablet)
  if (userAgent.includes("Mobile")) {
    device = "mobile"
  } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
    device = "tablet"
  } else if (device === "unknown") {
    device = "desktop"
  }

  // Extract platform info
  if (userAgent.includes("Win64") || userAgent.includes("WOW64")) {
    platform = "Windows 64-bit"
  } else if (userAgent.includes("Windows")) {
    platform = "Windows"
  } else if (userAgent.includes("Mac")) {
    platform = "macOS"
  } else if (userAgent.includes("Linux")) {
    platform = "Linux"
  } else if (userAgent.includes("Android")) {
    platform = "Android"
  } else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    platform = "iOS"
  }

  return {
    userAgent,
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    platform,
  }
}

/**
 * Extract user device and browser information from Next.js request
 * 
 * @param request - Next.js request object
 * @returns User device information including IP, browser, OS, device type
 */
export function extractUserDeviceInfo(request: NextRequest): UserDeviceInfo {
  const ip = getClientIP(request)
  const userAgent = request.headers.get("user-agent")

  const parsedInfo = parseUserAgent(userAgent)

  return {
    ip,
    ...parsedInfo,
  }
}


