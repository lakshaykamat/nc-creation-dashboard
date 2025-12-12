/**
 * Allocation Preview Table Component
 * 
 * Displays a table showing the current allocation preview:
 * - DDN articles (always shown first)
 * - Person-allocated articles
 * - Unallocated articles (marked as "NEED TO ALLOCATE")
 * 
 * @module components/file-allocator/allocation-preview-table
 */

import { Field, FieldLabel } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type AllocatedArticle } from "@/types/file-allocator"

interface AllocationPreviewTableProps {
  displayArticles: AllocatedArticle[]
}

/**
 * Renders the allocation preview table.
 * 
 * @param props - Component props
 * @param props.displayArticles - Array of articles to display (allocated + unallocated)
 */
export function AllocationPreviewTable({
  displayArticles,
}: AllocationPreviewTableProps) {
  if (displayArticles.length === 0) {
    return null
  }

  return (
    <Field>
      <div className="space-y-2">
        <FieldLabel>Preview or Edit</FieldLabel>
        <div className="rounded-md border bg-background/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Article</TableHead>
                <TableHead className="text-right">Pages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayArticles.map((item, index) => (
                <TableRow
                  key={`${item.name}-${item.articleId}-${index}`}
                >
                  <TableCell>{item.month || "—"}</TableCell>
                  <TableCell>{item.date || "—"}</TableCell>
                  <TableCell className="font-medium">
                    {item.name || "—"}
                  </TableCell>
                  <TableCell>{item.articleId}</TableCell>
                  <TableCell className="text-right">
                    {item.pages}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Field>
  )
}

