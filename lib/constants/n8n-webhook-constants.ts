/**
 * N8N Webhook Constants
 * 
 * Constants for N8N webhook API URLs
 * 
 * @module lib/constants/n8n-webhook-constants
 */

/**
 * N8N webhook base URL
 */
export const N8N_WEBHOOK_BASE_URL = "https://n8n-ex6e.onrender.com/webhook"

/**
 * N8N webhook endpoints
 */
export const N8N_WEBHOOK_ENDPOINTS = {
  /**
   * Today's emails endpoint
   */
  TODAY_EMAILS: `${N8N_WEBHOOK_BASE_URL}/today-emails`,
  
  /**
   * Allocations endpoint
   */
  ALLOCATIONS: `${N8N_WEBHOOK_BASE_URL}/allocations`,
  
  /**
   * Update allocation endpoint
   */
  UPDATE_ALLOCATION: `${N8N_WEBHOOK_BASE_URL}/update-allocation`,
  
  /**
   * Last two days files endpoint
   */
  LAST_TWO_DAYS_FILES: `${N8N_WEBHOOK_BASE_URL}/last-two-days-files`,
} as const

