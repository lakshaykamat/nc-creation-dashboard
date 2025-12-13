/**
 * Timezone Constants
 * 
 * Centralized timezone configuration
 * 
 * @module lib/constants/timezone-constants
 */

/**
 * Application timezone
 * 
 * Defaults to UTC if not set in environment variables
 * Set APP_TIMEZONE in Vercel dashboard (e.g., "Asia/Kolkata", "America/New_York")
 */
export const APP_TIMEZONE = process.env.APP_TIMEZONE || "UTC"

