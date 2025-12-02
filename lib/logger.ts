import { NextRequest } from "next/server"
import { randomUUID } from "crypto"

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR"

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

export interface ExternalApiCall {
  url: string
  method: string
  status: number
  duration: number
  error?: string
}

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

class Logger {
  private service: string
  private environment: string

  constructor() {
    this.service = "nc-dashboard-api"
    this.environment = process.env.NODE_ENV || "development"
  }

  private generateRequestId(): string {
    return randomUUID()
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for")
    if (forwarded) {
      return forwarded.split(",")[0].trim()
    }

    const realIP = request.headers.get("x-real-ip")
    if (realIP) return realIP

    const cfConnectingIP = request.headers.get("cf-connecting-ip")
    if (cfConnectingIP) return cfConnectingIP

    return "unknown"
  }

  private parseUserAgent(userAgent: string) {
    const ua = userAgent.toLowerCase()

    let deviceType = "desktop"
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      deviceType = "mobile"
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      deviceType = "tablet"
    }

    let browser = "unknown"
    if (ua.includes("chrome") && !ua.includes("edg")) {
      browser = "Chrome"
    } else if (ua.includes("firefox")) {
      browser = "Firefox"
    } else if (ua.includes("safari") && !ua.includes("chrome")) {
      browser = "Safari"
    } else if (ua.includes("edg")) {
      browser = "Edge"
    } else if (ua.includes("opera") || ua.includes("opr")) {
      browser = "Opera"
    }

    let os = "unknown"
    if (ua.includes("windows")) {
      os = "Windows"
    } else if (ua.includes("mac")) {
      os = "macOS"
    } else if (ua.includes("linux")) {
      os = "Linux"
    } else if (ua.includes("android")) {
      os = "Android"
    } else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) {
      os = "iOS"
    }

    return { type: deviceType, browser, os }
  }

  private sanitizeHeaders(headers: Headers): Record<string, string> {
    const sanitized: Record<string, string> = {}
    const sensitiveKeys = [
      "authorization",
      "cookie",
      "x-api-key",
      "x-auth-token",
      "api-key",
      "access-token",
    ]

    headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      if (!sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
        sanitized[key] = value
      } else {
        sanitized[key] = "[REDACTED]"
      }
    })

    return sanitized
  }

  private formatDuration(duration: number): string {
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(2)}s`
  }

  private getLogLevel(status: number, error?: boolean): LogLevel {
    if (error) return "ERROR"
    if (status >= 500) return "ERROR"
    if (status >= 400) return "WARN"
    return "INFO"
  }

  private formatDataSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
  }

  createRequestContext(request: NextRequest, requestId?: string): RequestContext {
    const userAgent = request.headers.get("user-agent") || "unknown"
    const url = request.url
    const path = new URL(url).pathname
    const queryParams = Object.fromEntries(new URL(url).searchParams.entries())

    return {
      requestId: requestId || this.generateRequestId(),
      method: request.method,
      path,
      url,
      ip: this.getClientIP(request),
      userAgent,
      device: this.parseUserAgent(userAgent),
      headers: this.sanitizeHeaders(request.headers),
      queryParams,
      timestamp: new Date().toISOString(),
    }
  }

  logRequest(
    requestContext: RequestContext,
    responseContext: ResponseContext,
    externalApiCalls?: ExternalApiCall[],
    metadata?: Record<string, unknown>
  ): void {
    const level = this.getLogLevel(
      responseContext.status,
      !!responseContext.error
    )

    const durationFormatted = this.formatDuration(responseContext.duration)
    const dataSizeFormatted = responseContext.dataSize
      ? this.formatDataSize(responseContext.dataSize)
      : undefined

    const message = responseContext.error
      ? `Request failed: ${responseContext.error.message}`
      : `Request completed successfully`

    const logEntry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      service: this.service,
      environment: this.environment,
      request: requestContext,
      response: {
        ...responseContext,
        duration: responseContext.duration,
      },
      externalApiCalls,
      message,
      metadata: {
        ...metadata,
        durationFormatted,
        dataSizeFormatted,
        performance: this.categorizePerformance(responseContext.duration),
      },
    }

    this.outputLog(logEntry)
  }

  private categorizePerformance(duration: number): string {
    if (duration < 500) return "excellent"
    if (duration < 1000) return "good"
    if (duration < 2000) return "acceptable"
    if (duration < 5000) return "slow"
    return "very-slow"
  }

  private outputLog(logEntry: LogEntry): void {
    const logString = JSON.stringify(logEntry, null, 2)

    switch (logEntry.level) {
      case "ERROR":
        console.error(logString)
        break
      case "WARN":
        console.warn(logString)
        break
      case "DEBUG":
        if (this.environment === "development") {
          console.debug(logString)
        }
        break
      default:
        console.log(logString)
    }
  }

  logError(
    requestContext: RequestContext,
    error: Error | unknown,
    metadata?: Record<string, unknown>
  ): void {
    const errorContext: ResponseContext = {
      status: 500,
      statusText: "Internal Server Error",
      duration: 0,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    }

    this.logRequest(requestContext, errorContext, undefined, metadata)
  }

  logExternalApiCall(
    url: string,
    method: string,
    startTime: number,
    status: number,
    error?: string
  ): ExternalApiCall {
    const duration = Date.now() - startTime
    return {
      url,
      method,
      status,
      duration,
      error,
    }
  }
}

export const logger = new Logger()

