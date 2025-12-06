import type { ExtractedRow } from "@/types/portal-data"

// Re-export for backward compatibility
export type { ExtractedRow }

// Pre-compile regex patterns for better performance
const ROW_REGEX = /<tr[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/tr>/g
const CELL_REGEX = /<td[^>]*>([\s\S]*?)<\/td>/g
const TAG_REGEX = /<[^>]*>/g
const QA_TEST_REGEX = /Pending QA Validation/i

export function extractRows(html: string): ExtractedRow[] {
  // Estimate initial capacity to reduce array resizing
  const rows: ExtractedRow[] = []
  let match
  ROW_REGEX.lastIndex = 0 // Reset regex state

  while ((match = ROW_REGEX.exec(html)) !== null) {
    const fullHtml = match[0]
    const rowHtml = match[2]

    // Extract cells more efficiently - pre-allocate array
    const cells: string[] = new Array(9)
    let cellIndex = 0
    const cellMatches = rowHtml.matchAll(CELL_REGEX)
    
    for (const cellMatch of cellMatches) {
      // Direct assignment to pre-allocated array
      cells[cellIndex++] = cellMatch[1].replace(TAG_REGEX, "").trim()
      if (cellIndex >= 9) break // Early exit if we have enough cells
    }

    if (cellIndex < 9) continue

    // Pre-check QA status once (reuse regex test)
    const isInQA = QA_TEST_REGEX.test(fullHtml)

    // Direct object creation without intermediate variables
    rows.push({
      client: cells[0],
      journal: cells[1],
      articleId: cells[2],
      src: cells[3],
      msp: cells[4],
      status: cells[5],
      assignDate: cells[6],
      dueDate: cells[7],
      priority: cells[8],
      isInQA,
    })
  }

  return rows
}

