/**
 * Portal Data Combiner Utility Functions
 * 
 * Pure utility functions for combining portal data
 * 
 * @module lib/portal-data/portal-data-combiner-utils
 */

import type { PortalData } from "@/types/portal-data"
import type { ExtractedRow } from "@/types/portal-data"

/**
 * Combine extracted rows with done-by map into portal data
 * 
 * @param extractedRows - Array of extracted rows
 * @param doneByMap - Map of article IDs to done-by values
 * @returns Array of portal data
 */
export function combinePortalData(
  extractedRows: ExtractedRow[],
  doneByMap: Map<string, string>
): PortalData[] {
  const portalData: PortalData[] = new Array(extractedRows.length)
  const rowsLen = extractedRows.length

  for (let i = 0; i < rowsLen; i++) {
    const row = extractedRows[i]
    const articleId = row.articleId
    const trimmedId = articleId.trim()
    const doneBy = doneByMap.get(trimmedId) || null

    portalData[i] = {
      client: row.client,
      journal: row.journal,
      articleId: articleId,
      src: row.src,
      msp: row.msp,
      status: row.status,
      assignDate: row.assignDate,
      dueDate: row.dueDate,
      priority: row.priority,
      isInQA: row.isInQA,
      doneBy,
    }
  }

  return portalData
}

