/**
 * Common type definitions used across the application
 * 
 * @module types/common
 */

import type { NextRequest } from "next/server"

/**
 * Log level types
 */
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR"

/**
 * Request context for logging
 */
export interface RequestContext {
  requestId: string
  method: string
  path: string
  url: string
  ip: string
  userAgent: string
  device: {
    type: string
    browser: string
    os: string
  }
  headers: Record<string, string>
  queryParams: Record<string, string>
  timestamp: string
}

/**
 * Response context for logging
 */
export interface ResponseContext {
  status: number
  statusText: string
  duration: number
  dataSize?: number
  error?: {
    message: string
    stack?: string
    code?: string | number
  }
}

/**
 * External API call information
 */
export interface ExternalApiCall {
  url: string
  method: string
  status: number
  duration: number
  error?: string
}

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel
  timestamp: string
  service: string
  environment: string
  request: RequestContext
  response?: ResponseContext
  externalApiCalls?: ExternalApiCall[]
  message: string
  metadata?: Record<string, unknown>
}

