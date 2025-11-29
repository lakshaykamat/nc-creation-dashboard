import type { PortalData } from "@/hooks/use-portal-data"
import type { ExtractedRow } from "@/lib/extract-rows"

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

