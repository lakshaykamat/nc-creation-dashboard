import { readFileSync } from "fs"
import { join } from "path"
import type { DetectArticlesResponse } from "@/types/file-allocator"

/**
 * Reads sample allocation data from JSON file
 */
function loadSampleAllocationData(): DetectArticlesResponse[] {
  const sampleDataPath = join(process.cwd(), "lib", "sample-allocation.json")
  const data = JSON.parse(readFileSync(sampleDataPath, "utf-8"))
  return data as DetectArticlesResponse[]
}

/**
 * Gets sample allocation data based on recent parameter
 * @param recent - Query parameter: "1" for latest, "2" for previous, etc.
 * @returns Sample allocation data object
 */
export function getSampleAllocationData(
  recent?: string | null
): DetectArticlesResponse {
  const sampleAllocationData = loadSampleAllocationData()

  // If recent is "1" or not provided, return first item (latest)
  // Otherwise, convert recent to index (recent "2" = index 0, recent "3" = index 1, etc.)
  let dataIndex = 0

  if (recent) {
    const recentNum = parseInt(recent, 10)
    if (!isNaN(recentNum) && recentNum > 1) {
      // recent "2" = index 0, recent "3" = index 1, etc.
      dataIndex = recentNum - 2
    }
  }

  // Ensure index is within bounds
  if (dataIndex < 0 || dataIndex >= sampleAllocationData.length) {
    dataIndex = 0
  }

  return sampleAllocationData[dataIndex]
}

/**
 * Checks if sample data should be used based on environment variable
 * Currently disabled - always returns false
 */
export function shouldUseSampleData(): boolean {
  return false
}

