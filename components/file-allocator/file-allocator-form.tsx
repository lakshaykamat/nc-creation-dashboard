/**
 * Article Allocation Form Component
 * 
 * Main form component for allocating articles to team members.
 * Uses a custom hook for state management and smaller sub-components for UI.
 * 
 * @module components/file-allocator-form
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toast } from "@/components/ui/toast"
import { FieldGroup } from "@/components/ui/field"
import { useFileAllocatorFormState } from "@/hooks/file-allocator/use-file-allocator-form-state"
import { AllocationMethodField } from "./fields/allocation-method-field"
import { PriorityFieldsList } from "./fields/priority-fields-list"
import { DdnArticlesField } from "./fields/ddn-articles-field"
import { AllocationPreviewDialog } from "./dialogs/allocation-preview-dialog"
import { FormSubmitButtonWithDialog } from "./buttons/form-submit-button-with-dialog"
import { AllocationLoadingDialog } from "./dialogs/allocation-loading-dialog"
import { AllocationSuccessDialog } from "./dialogs/allocation-success-dialog"
import { AllocationFailureDialog } from "./dialogs/allocation-failure-dialog"

interface FileAllocatorFormProps {
  /** Array of article strings in format "ARTICLE_ID [PAGES]" */
  newArticlesWithPages?: string[] | null
}

/**
 * Main Article Allocation Form component.
 * 
 * This component orchestrates the entire form by:
 * - Using a custom hook for all state management and business logic
 * - Rendering smaller, focused sub-components for each form section
 * - Handling form submission
 * 
 * @param props - Component props
 * @param props.newArticlesWithPages - Array of article strings to allocate
 * 
 * @example
 * ```tsx
 * <FileAllocatorForm newArticlesWithPages={["CDC101217 [24]", "EA147928 [29]"]} />
 * ```
 */
export function FileAllocatorForm({ newArticlesWithPages }: FileAllocatorFormProps) {
  const formState = useFileAllocatorFormState(newArticlesWithPages)

  // Wrap onSubmit to work with AlertDialog (no form event needed)
  const handleFormSubmit = async () => {
    const values = formState.watch()
    await formState.onSubmit(values)
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6">
      <Card className="w-full">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">Article Allocation Form</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Distribute articles among team members based on allocation method
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form className="space-y-4 sm:space-y-6">
            <FieldGroup>
              <AllocationMethodField control={formState.control} />

              <PriorityFieldsList
                fields={formState.fields}
                control={formState.control}
                totalFiles={formState.totalFiles}
                remainingFiles={formState.remainingFiles}
                draggedIndex={formState.draggedIndex}
                dragOverIndex={formState.dragOverIndex}
                isLoadingMembers={formState.isLoadingMembers}
                onDragStart={formState.handleDragStart}
                onDragOver={formState.handleDragOver}
                onDragLeave={formState.handleDragLeave}
                onDrop={formState.handleDrop}
              />

              <DdnArticlesField
                register={formState.register}
                validationError={formState.ddnValidationError}
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <AllocationPreviewDialog
                    displayArticles={formState.displayArticles}
                    disabled={formState.previewDisabled}
                    manuallyAddedArticleIds={formState.manuallyAddedArticleIds}
                    onUpdateFromPastedData={formState.handleUpdateFromPastedData}
                    onDeleteArticle={formState.handleDeleteArticle}
                    onUpdateArticle={formState.handleUpdateArticle}
                  />
                </div>
                <div className="flex-1">
                  <FormSubmitButtonWithDialog
                    isDisabled={formState.allocateDisabled}
                    onSubmit={handleFormSubmit}
                  />
                </div>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      {formState.showToast && (
        <Toast
          message={formState.toastMessage}
          type={formState.toastType || "info"}
          onClose={() => formState.setShowToast(false)}
        />
      )}
      <AllocationLoadingDialog
        open={formState.showLoading}
      />
      <AllocationSuccessDialog
        open={formState.showSuccess}
        itemCount={formState.successItemCount}
        allocation={formState.submittedAllocation || undefined}
      />
      <AllocationFailureDialog
        open={formState.showFailure}
        errorMessage={formState.failureMessage}
      />
    </div>
  )
}
