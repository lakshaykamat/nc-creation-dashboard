/**
 * Type definitions for Portal Data feature
 * 
 * @module types/portal-data
 */

/**
 * Portal data structure
 */
export type PortalData = {
  articleId: string
  doneBy: string | null
  src: string
  client: string
  journal: string
  msp: string | number
  status: string
  assignDate: string
  dueDate: string
  priority: string
  isInQA?: boolean
}

/**
 * Error type for portal data operations
 */
export type PortalDataError = {
  code?: number
  message: string
  hint?: string
}

/**
 * Response type for portal data API
 */
export type PortalDataResponse = {
  data: PortalData[]
  message?: string
}

/**
 * Last two days file data structure
 */
export type LastTwoDaysFileData = {
  row_number: number
  Month: string
  Date: string
  "Article number": string
  Pages: number
  Completed: string
  "Done by": string
  Time: string
}

/**
 * Error type for last two days files operations
 */
export type LastTwoDaysFileDataError = {
  code?: number
  message: string
  hint?: string
}

/**
 * Response type for last two days files API
 */
export type LastTwoDaysFileDataResponse = {
  data: LastTwoDaysFileData[]
  message?: string
}

/**
 * Extracted row from HTML parsing
 */
export type ExtractedRow = {
  client: string
  journal: string
  articleId: string
  src: string
  msp: string
  status: string
  assignDate: string
  dueDate: string
  priority: string
  isInQA: boolean
}

