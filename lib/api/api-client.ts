/**
 * API Client Utilities
 * 
 * Helper functions for making authenticated API requests.
 * Note: Authentication is now handled via session cookies, not API keys.
 * 
 * @module lib/api/api-client
 */

/**
 * Get default headers for API requests.
 * No API key needed - authentication handled via session cookies automatically.
 */
export function getApiHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
}
