/**
 * Custom hook for managing Article Allocation Form state and business logic.
 * 
 * This hook centralizes:
 * - Form state management (React Hook Form integration)
 * - Business logic (allocation rules, distribution algorithms)
 * - Form validation and computed values
 * 
 * Note: Pure utility functions (parsing, calculations) are in lib/file-allocator-utils.ts
 * 
 * @module hooks/use-file-allocator-form-state
 */

import { useState, useEffect, useMemo, useRef } from "react"
import { useForm, useFieldArray, type Control, type UseFormWatch, type UseFormSetValue } from "react-hook-form"
import { type PriorityField, ALLOCATION_METHODS } from "@/lib/constants/file-allocator-constants"
import { useTeamMembers } from "./use-team-members"
import { parseNewArticlesWithPages } from "@/lib/file-allocator/articles/parse-article-utils"
import { validateDdnArticles, isOverAllocated } from "@/lib/file-allocator/allocation/allocation-validation-utils"
import { calculateAllocatedFiles, calculateRemainingFiles } from "@/lib/file-allocator/allocation/allocation-calculation-utils"
import { getOverAllocationMessage } from "@/lib/file-allocator/allocation/allocation-message-utils"
import { distributeArticles } from "@/lib/file-allocator/allocation/allocation-distribution-utils"
import { buildFinalAllocation } from "@/lib/file-allocator/allocation/allocation-result-utils"
import { hasPriorityFieldsChanged } from "@/lib/file-allocator/priority/priority-fields-comparison-utils"
import { transformTeamMembersToPriorityFields } from "@/lib/file-allocator/priority/priority-fields-transformation-utils"
import { getCurrentMonthAndDate } from "@/lib/common/date-utils"
import { getUnallocatedArticles } from "@/lib/file-allocator/articles/unallocated-articles-extraction-utils"
import { savePriorityOrder, loadPriorityOrder } from "@/lib/file-allocator/priority/priority-order-storage-utils"
import { reorderPriorityFields, extractPriorityOrder } from "@/lib/file-allocator/priority/priority-order-utils"
import type {
  FormValues,
  AllocatedArticle,
  PersonAllocation,
  FinalAllocationResult,
  ParsedArticle,
} from "@/types/file-allocator"

// Re-export types for backward compatibility
export type {
  FormValues,
  AllocatedArticle,
  PersonAllocation,
  FinalAllocationResult,
}

/**
 * Return type for useFileAllocatorFormState hook
 */
export interface UseFileAllocatorFormStateReturn {
  // Form control
  control: Control<FormValues>
  register: ReturnType<typeof useForm<FormValues>>["register"]
  handleSubmit: ReturnType<typeof useForm<FormValues>>["handleSubmit"]
  watch: UseFormWatch<FormValues>
  setValue: UseFormSetValue<FormValues>
  errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"]
  
  // Field array for priority fields
  fields: ReturnType<typeof useFieldArray<FormValues, "priorityFields">>["fields"]
  move: ReturnType<typeof useFieldArray<FormValues, "priorityFields">>["move"]
  
  // Drag and drop state
  draggedIndex: number | null
  setDraggedIndex: (index: number | null) => void
  dragOverIndex: number | null
  setDragOverIndex: (index: number | null) => void
  
  // Toast state
  showToast: boolean
  setShowToast: (show: boolean) => void
  toastMessage: string
  toastType?: "error" | "success" | "info"
  
  // Loading state
  showLoading: boolean
  
  // Success state
  showSuccess: boolean
  successItemCount: number
  submittedAllocation: FinalAllocationResult | null
  
  // Failure state
  showFailure: boolean
  failureMessage: string
  
  // Team members loading state
  isLoadingMembers: boolean
  
  // Computed values
  allocationMethod: string
  priorityFields: PriorityField[]
  ddnArticles: string[]
  ddnValidationError: string | null
  parsedArticles: ReturnType<typeof parseNewArticlesWithPages>
  totalFiles: number
  effectiveTotalFiles: number
  allocatedFiles: number
  remainingFiles: number
  isOverAllocated: boolean
  allocatedArticles: AllocatedArticle[]
  unallocatedArticles: AllocatedArticle[]
  displayArticles: AllocatedArticle[]
  finalAllocation: FinalAllocationResult
  hasAllocations: boolean
  previewDisabled: boolean
  allocateDisabled: boolean
  
  // Handlers
  handleDragStart: (index: number) => void
  handleDragOver: (e: React.DragEvent, index: number) => void
  handleDragLeave: () => void
  handleDrop: (dropIndex: number) => void
  onSubmit: (values: FormValues) => void
}

/**
 * Custom hook that manages all state and logic for the Article Allocation Form.
 * 
 * Centralizes form state management, business logic, and computed values:
 * - Integrates React Hook Form for form state
 * - Parses articles from input data
 * - Calculates allocation metrics (total, allocated, remaining files)
 * - Distributes articles based on selected allocation method
 * - Validates DDN articles and over-allocation scenarios
 * - Manages drag-and-drop reordering of priority fields
 * - Handles form submission and API communication
 * 
 * The hook uses formValues watching to ensure reactivity when nested array
 * values change, and memoizes expensive computations to prevent unnecessary
 * recalculations.
 * 
 * @param newArticlesWithPages - Optional array of article strings in format "ARTICLE_ID [PAGES]"
 * @returns Object containing:
 *   - Form control: control, register, watch, setValue, errors
 *   - Field array: fields, move (for drag-and-drop)
 *   - State: drag/drop indices, toast, loading, success, failure states
 *   - Computed values: allocation metrics, articles, disable conditions
 *   - Handlers: drag-and-drop, form submission
 * 
 * @example
 * ```tsx
 * const formState = useFileAllocatorFormState(newArticlesWithPages)
 * 
 * return (
 *   <form onSubmit={formState.handleSubmit(formState.onSubmit)}>
 *     // Use formState properties and handlers
 *   </form>
 * )
 * ```
 */
export function useFileAllocatorFormState(
  newArticlesWithPages?: string[] | null
): UseFileAllocatorFormStateReturn {
  // Fetch team members dynamically
  const { members: teamMembers, isLoading: isLoadingMembers } = useTeamMembers()

  // Create initial priority fields from team members
  const initialPriorityFields = useMemo(() => {
    const membersForFields = teamMembers.map(m => ({ id: m.id, label: m.label }))
    const baseFields = transformTeamMembersToPriorityFields(membersForFields)
    
    // Try to restore saved order from localStorage
    const savedOrder = loadPriorityOrder()
    if (savedOrder && savedOrder.length > 0) {
      return reorderPriorityFields(baseFields, savedOrder)
    }
    
    return baseFields
  }, [teamMembers])

  // Initialize react-hook-form
  const {
    register,
    handleSubmit: formHandleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      allocationMethod: ALLOCATION_METHODS.BY_PRIORITY,
      ddnArticles: "",
      priorityFields: initialPriorityFields,
    },
  })

  // Update form when team members change (after initial load)
  useEffect(() => {
    if (!isLoadingMembers) {
      const currentFields = watch("priorityFields")
      const membersForFields = teamMembers.map(m => ({ id: m.id, label: m.label }))
      const baseFields = transformTeamMembersToPriorityFields(membersForFields)
      
      // Only update if the members have changed
      if (hasPriorityFieldsChanged(currentFields, baseFields)) {
        // Try to restore saved order from localStorage
        const savedOrder = loadPriorityOrder()
        const newFields = savedOrder && savedOrder.length > 0
          ? reorderPriorityFields(baseFields, savedOrder)
          : baseFields
        
        setValue("priorityFields", newFields, {
          shouldValidate: false,
          shouldDirty: false,
        })
      }
    }
  }, [teamMembers, isLoadingMembers, setValue, watch])

  const { fields, move } = useFieldArray({
    control,
    name: "priorityFields",
  })

  // Local state for drag and drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"error" | "success" | "info">("info")
  
  // Track previous allocation method for reset logic
  const prevAllocationMethodRef = useRef<string>("")

  // Watch specific form fields for better reactivity
  const allocationMethod = watch("allocationMethod") || ""
  const textareaValue = watch("ddnArticles") || ""
  const priorityFields = watch("priorityFields") || []

  // Parse articles from input data
  const parsedArticles = useMemo(() => {
    return parseNewArticlesWithPages(newArticlesWithPages)
  }, [newArticlesWithPages])

  // Get available article IDs for DDN validation
  const availableArticleIds = useMemo(
    () => parsedArticles.map((item) => item.articleId),
    [parsedArticles]
  )

  // Total files count
  const totalFiles = parsedArticles.length

  // Validate DDN articles
  const { articles: ddnArticles, error: ddnValidationError } = useMemo(
    () => validateDdnArticles(textareaValue, availableArticleIds),
    [textareaValue, availableArticleIds]
  )

  // Effective total files (excluding DDN articles)
  const ddnArticleCount = ddnArticles.length
  const effectiveTotalFiles = Math.max(totalFiles - ddnArticleCount, 0)

  // Calculate allocation metrics
  const allocatedFiles = useMemo(
    () => calculateAllocatedFiles(priorityFields),
    [priorityFields]
  )

  const remainingFiles = useMemo(
    () => calculateRemainingFiles(effectiveTotalFiles, allocatedFiles),
    [effectiveTotalFiles, allocatedFiles]
  )

  const isOverAllocatedValue = useMemo(
    () => isOverAllocated(effectiveTotalFiles, allocatedFiles) || !!ddnValidationError,
    [effectiveTotalFiles, allocatedFiles, ddnValidationError]
  )

  // Get current date and month for allocation
  const { month, date } = useMemo(() => getCurrentMonthAndDate(), [])

  // Build allocated articles based on current form state
  const allocatedArticles = useMemo(() => {
    if (!Array.isArray(priorityFields) || priorityFields.length === 0) {
      return []
    }
    
    if (!parsedArticles || parsedArticles.length === 0) {
      return []
    }
    
    return distributeArticles(
      priorityFields,
      parsedArticles,
      ddnArticles,
      allocationMethod || ALLOCATION_METHODS.BY_PRIORITY,
      month,
      date
    )
  }, [priorityFields, parsedArticles, ddnArticles, allocationMethod, month, date])

  // Get unallocated articles for display
  const allocatedArticleIds = useMemo(
    () => new Set(allocatedArticles.map((a) => a.articleId)),
    [allocatedArticles]
  )

  const unallocatedArticles = useMemo(() => {
    return getUnallocatedArticles(
      parsedArticles,
      allocatedArticleIds,
      allocationMethod,
      month,
      date
    )
  }, [parsedArticles, allocatedArticleIds, allocationMethod, month, date])

  // Combine allocated and unallocated for display
  const displayArticles = useMemo(
    () => [...allocatedArticles, ...unallocatedArticles],
    [allocatedArticles, unallocatedArticles]
  )

  const hasAllocations = displayArticles.length > 0 || parsedArticles.length > 0

  // Disable conditions
  const previewDisabled = useMemo(
    () => isOverAllocatedValue || parsedArticles.length === 0,
    [isOverAllocatedValue, parsedArticles.length]
  )

  const allocateDisabled = useMemo(
    () => 
      isOverAllocatedValue || 
      parsedArticles.length === 0 || 
      (unallocatedArticles.length === 0 && allocatedFiles === 0),
    [isOverAllocatedValue, parsedArticles.length, unallocatedArticles.length, allocatedFiles]
  )

  // Build final allocation object
  const finalAllocation = useMemo(() => {
    return buildFinalAllocation(
      priorityFields,
      parsedArticles,
      ddnArticles,
      allocationMethod || "",
      month,
      date
    )
  }, [priorityFields, ddnArticles, parsedArticles, allocationMethod, month, date])

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    move(draggedIndex, dropIndex)
    
    // Get updated fields after move and save to localStorage
    const updatedFields = watch("priorityFields") || []
    const order = extractPriorityOrder(updatedFields as PriorityField[])
    savePriorityOrder(order)
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Watch for priority field changes to update toast
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name?.startsWith("priorityFields")) {
        const currentFields = (value.priorityFields || []) as PriorityField[]
        const allocated = calculateAllocatedFiles(currentFields)
        
        if (isOverAllocated(effectiveTotalFiles, allocated)) {
          const overBy = allocated - effectiveTotalFiles
          setToastMessage(getOverAllocationMessage(overBy))
          setShowToast(true)
        } else {
          setShowToast(false)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, effectiveTotalFiles, isOverAllocated, getOverAllocationMessage])

  // Reset form when allocation method changes
  useEffect(() => {
    if (prevAllocationMethodRef.current && prevAllocationMethodRef.current !== allocationMethod) {
      // Reset all priority field values to 0
      const currentFields = watch("priorityFields") || []
      currentFields.forEach((_field, index) => {
        setValue(`priorityFields.${index}.value`, 0, {
          shouldValidate: false,
          shouldDirty: false,
        })
      })
      
      // Reset DDN articles textarea
      setValue("ddnArticles", "", {
        shouldValidate: false,
        shouldDirty: false,
      })
      
      // Hide toast when resetting
      setShowToast(false)
    }
    
    prevAllocationMethodRef.current = allocationMethod || ""
  }, [allocationMethod, setValue, watch])

  // Loading state
  const [showLoading, setShowLoading] = useState(false)
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false)
  const [successItemCount, setSuccessItemCount] = useState(0)
  const [submittedAllocation, setSubmittedAllocation] = useState<FinalAllocationResult | null>(null)
  
  // Failure state
  const [showFailure, setShowFailure] = useState(false)
  const [failureMessage, setFailureMessage] = useState<string>("")

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    // Show loading dialog immediately
    setShowLoading(true)
    
    const submissionAllocation = buildFinalAllocation(
      values.priorityFields,
      parsedArticles,
      ddnArticles,
      values.allocationMethod,
      month,
      date
    )
    
    try {
      // Submit allocation to API
      const response = await fetch("/api/submit-allocation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionAllocation),
      })

      const result = await response.json()

      // Hide loading dialog
      setShowLoading(false)

      if (!response.ok || !result.success) {
        // Show failure dialog and redirect to file-allocator page
        setFailureMessage(result.message || "Failed to submit allocation")
        setShowFailure(true)
        return
      }

      // Show success dialog and redirect to home
      setSuccessItemCount(result.itemCount || 0)
      setSubmittedAllocation(submissionAllocation)
      setShowSuccess(true)
    } catch (error) {
      console.error("Error submitting allocation:", error)
      // Hide loading dialog
      setShowLoading(false)
      // Show failure dialog and redirect to file-allocator page
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setFailureMessage(errorMessage)
      setShowFailure(true)
    }
  }

  return {
    // Form control
    control,
    register,
    handleSubmit: formHandleSubmit,
    watch,
    setValue,
    errors,
    
    // Field array
    fields,
    move,
    
    // Drag and drop state
    draggedIndex,
    setDraggedIndex,
    dragOverIndex,
    setDragOverIndex,
    
    // Toast state
    showToast,
    setShowToast,
    toastMessage,
    toastType,
    
    // Loading state
    showLoading,
    
    // Success state
    showSuccess,
    successItemCount,
    submittedAllocation,
    
    // Failure state
    showFailure,
    failureMessage,
    
    // Team members loading state
    isLoadingMembers,
    
    // Computed values
    allocationMethod,
    priorityFields,
    ddnArticles,
    ddnValidationError,
    parsedArticles,
    totalFiles,
    effectiveTotalFiles,
    allocatedFiles,
    remainingFiles,
    isOverAllocated: isOverAllocatedValue,
    allocatedArticles,
    unallocatedArticles,
    displayArticles,
    finalAllocation,
    hasAllocations,
    previewDisabled,
    allocateDisabled,
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    onSubmit,
  }
}


