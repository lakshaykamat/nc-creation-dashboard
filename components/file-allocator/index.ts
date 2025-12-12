/**
 * File Allocator Components
 * 
 * This directory contains all sub-components for the Article Allocation Form.
 * Components are organized into subfolders:
 * - dialogs/ - Dialog components
 * - fields/ - Form field components
 * - preview/ - Preview-related components
 * - buttons/ - Button components
 * 
 * @module components/file-allocator
 */

// Main form component
export { FileAllocatorForm } from "./file-allocator-form"

// Fields
export { AllocationMethodField } from "./fields/allocation-method-field"
export { PriorityFieldItem } from "./fields/priority-field-item"
export { PriorityFieldsList } from "./fields/priority-fields-list"
export { DdnArticlesField } from "./fields/ddn-articles-field"

// Preview components
export { AllocationPreviewTable } from "./preview/allocation-preview-table"
export { PreviewTableCell } from "./preview/preview-table-cell"
export { PreviewTableRow } from "./preview/preview-table-row"
export { PreviewTabContent } from "./preview/preview-tab-content"
export { EditTabContent } from "./preview/edit-tab-content"
export { PreviewMessage } from "./preview/preview-message"

// Dialogs
export { AllocationPreviewDialog } from "./dialogs/allocation-preview-dialog"
export { AllocationLoadingDialog } from "./dialogs/allocation-loading-dialog"
export { AllocationSuccessDialog } from "./dialogs/allocation-success-dialog"
export { AllocationFailureDialog } from "./dialogs/allocation-failure-dialog"

// Buttons
export { FormSubmitButton } from "./buttons/form-submit-button"
export { FormSubmitButtonWithDialog } from "./buttons/form-submit-button-with-dialog"
