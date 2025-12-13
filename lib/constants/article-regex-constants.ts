/**
 * Article Detection Regex Patterns
 * 
 * Centralized regex patterns for detecting and parsing article IDs and pages
 * across the application.
 * 
 * @module lib/constants/article-regex-constants
 */

/**
 * Pattern to detect article codes in text.
 * Matches: 2+ uppercase letters, followed by optional alphanumeric, ending with a digit.
 * Examples: "CDC101217", "EA147928", "ABC123"
 */
export const ARTICLE_ID_PATTERN = /^[A-Z]{2,}[A-Z0-9]*\d$/

/**
 * Pattern to parse article ID with pages in format: "ARTICLE_ID [PAGES]"
 * Captures: article ID and page count
 * Examples: "CDC101217 [24]", "EA147928 [29]"
 */
export const ARTICLE_WITH_PAGES_PATTERN = /^([^\s[\]]+)\s*\[(\d+)\]/

/**
 * Pattern to match numeric page count
 * Used for validating page numbers
 */
export const PAGE_COUNT_PATTERN = /^\d+$/

/**
 * Pattern to match date in format: DD/MM/YYYY or DD-MM-YYYY (without time)
 * Used in article extraction to identify end of article blocks
 */
export const DATE_PATTERN_SLASH = /^\d{1,2}\/\d{1,2}\/\d{4}$/
export const DATE_PATTERN_DASH = /^\d{1,2}-\d{1,2}-\d{4}$/

/**
 * Pattern to match time in format: HH:MM (24-hour)
 * Used in article extraction to identify end of article blocks
 */
export const TIME_PATTERN = /^\d{1,2}:\d{2}$/

/**
 * Pattern to match eMFC tokens (to skip during article extraction)
 */
export const EMFC_PATTERN = /^eMFC$/i
export const EMFC_WITH_NUMBER_PATTERN = /^eMFC[-:]\d+$/i

/**
 * Pattern to match source codes (all uppercase letters)
 * Used to skip source column like "TEX", "DOCX" in article extraction
 */
export const SOURCE_CODE_PATTERN = /^[A-Z]+$/i

/**
 * Pattern to match iOS devices (iPad or iPhone)
 * Used for clipboard operations
 */
export const IOS_DEVICE_PATTERN = /ipad|iphone/i

