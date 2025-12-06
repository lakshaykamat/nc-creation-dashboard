/**
 * Transform allocation data to webhook payload format
 * 
 * Converts FinalAllocationResult to the format expected by the webhook API.
 * 
 * @module hooks/file-allocator/transform-allocation-to-payload
 */

import type { FinalAllocationResult, AllocationItem } from "@/types/file-allocator"

// Re-export for backward compatibility
export type { AllocationItem }

/**
 * Transforms FinalAllocationResult into the webhook payload format
 * 
 * @param allocation - The final allocation result to transform
 * @returns Array of allocation items in webhook format
 */
export function transformAllocationToPayload(
  allocation: FinalAllocationResult
): AllocationItem[] {
  const allocationItems: AllocationItem[] = []

  // Add person allocations
  for (const personAllocation of allocation.personAllocations) {
    for (const article of personAllocation.articles) {
      allocationItems.push({
        Month: article.month,
        Date: article.date,
        "Article number": article.articleId,
        Pages: article.pages,
        Completed: "Not started",
        "Done by": personAllocation.person,
        Time: "",
      })
    }
  }

  // Add DDN articles
  for (const article of allocation.ddnArticles) {
    allocationItems.push({
      Month: article.month,
      Date: article.date,
      "Article number": article.articleId,
      Pages: article.pages,
      Completed: "Not started",
      "Done by": "DDN",
      Time: "",
    })
  }

  // Add unallocated articles
  for (const article of allocation.unallocatedArticles) {
    allocationItems.push({
      Month: article.month,
      Date: article.date,
      "Article number": article.articleId,
      Pages: article.pages,
      Completed: "Not started",
      "Done by": "NEED TO ALLOCATE",
      Time: "",
    })
  }

  return allocationItems
}

