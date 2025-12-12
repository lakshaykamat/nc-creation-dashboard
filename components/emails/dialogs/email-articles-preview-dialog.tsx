/**
 * Email Articles Preview Dialog Component
 * 
 * Dialog showing articles from selected emails in a preview table
 * 
 * @module components/emails/email-articles-preview-dialog
 */

"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface EmailArticlesPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articles: Array<{ articleId: string; pages: number }>
}

export function EmailArticlesPreviewDialog({
  open,
  onOpenChange,
  articles,
}: EmailArticlesPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Articles Preview</DialogTitle>
          <DialogDescription>
            {articles.length} article{articles.length !== 1 ? "s" : ""} ready to allocate
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto min-h-0">
          {articles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No articles to preview
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article ID</TableHead>
                    <TableHead className="text-right">Pages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article, index) => (
                    <TableRow key={`${article.articleId}-${index}`}>
                      <TableCell className="font-medium">{article.articleId}</TableCell>
                      <TableCell className="text-right">{article.pages}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

