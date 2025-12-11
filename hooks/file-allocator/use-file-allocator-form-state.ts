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
import { type PriorityField, ALLOCATION_METHODS } from "@/lib/file-allocator/file-allocator-constants"
import { useTeamMembers } from "./use-team-members"
import { useLastTwoDaysFiles } from "@/hooks/emails/use-last-two-days-files"
import { parseNewArticlesWithPages } from "@/lib/file-allocator/parse-article-utils"
import { validateDdnArticles, isOverAllocated } from "@/lib/file-allocator/allocation-validation-utils"
import { calculateAllocatedFiles, calculateRemainingFiles } from "@/lib/file-allocator/allocation-calculation-utils"
import { getOverAllocationMessage } from "@/lib/file-allocator/allocation-message-utils"
import { distributeArticles } from "@/lib/file-allocator/allocation-distribution-utils"
import { buildFinalAllocation } from "@/lib/file-allocator/allocation-result-utils"
import { filterAllocatedArticles } from "@/lib/file-allocator/filter-allocated-articles-utils"
import { generateFilteredArticlesToastMessage } from "@/lib/file-allocator/allocation-message-utils"
import { hasPriorityFieldsChanged } from "@/lib/file-allocator/priority-fields-comparison-utils"
import { transformTeamMembersToPriorityFields } from "@/lib/file-allocator/priority-fields-transformation-utils"
import { getCurrentMonthAndDate } from "@/lib/file-allocator/date-utils"
import { getUnallocatedArticles } from "@/lib/file-allocator/unallocated-articles-extraction-utils"
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
  displayArticles: AllocatedArticle[]
  finalAllocation: FinalAllocationResult
  hasAllocations: boolean
  
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
 * @param newArticlesWithPages - Array of article strings in format "ARTICLE_ID [PAGES]"
 * @returns Object containing all form state, computed values, and handlers
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
  
  // Fetch last-two-days-files in parallel to check for already allocated articles
  const { data: lastTwoDaysFiles = [] } = useLastTwoDaysFiles()

  // Create initial priority fields from team members
  const initialPriorityFields = useMemo(() => {
    const membersForFields = teamMembers.map(m => ({ id: m.id, label: m.label }))
    return transformTeamMembersToPriorityFields(membersForFields)
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
      const newFields = transformTeamMembersToPriorityFields(membersForFields)
      
      // Only update if the members have changed
      if (hasPriorityFieldsChanged(currentFields, newFields)) {
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

  // Watch form values - use watch() to ensure reactivity for nested arrays
  // Watching all fields ensures nested array changes are detected
  const formValues = watch()
  const allocationMethod = formValues.allocationMethod || ""
  const textareaValue = formValues.ddnArticles || ""
  const priorityFields = formValues.priorityFields || []

  // Parse articles from input data and filter out already allocated articles
  const { parsedArticles, filteredOutCount, filteredOutArticles } = useMemo(() => {
    const allParsed = parseNewArticlesWithPages(newArticlesWithPages)
    return filterAllocatedArticles(allParsed, lastTwoDaysFiles)
  }, [newArticlesWithPages, lastTwoDaysFiles])

  // Show toast when articles are filtered out
  useEffect(() => {
    if (filteredOutCount > 0 && lastTwoDaysFiles.length > 0) {
      const message = generateFilteredArticlesToastMessage(filteredOutCount, filteredOutArticles)
      setToastMessage(message)
      setToastType("info")
      setShowToast(true)
    }
  }, [filteredOutCount, filteredOutArticles, lastTwoDaysFiles.length])

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
  // Use formValues to ensure reactivity when nested values change
  const allocatedFiles = useMemo(
    () => calculateAllocatedFiles(formValues.priorityFields || []),
    [formValues]
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
  // Using formValues ensures reactivity when nested array values change
  const allocatedArticles = useMemo(() => {
    // Get current priorityFields from formValues to ensure we have latest values
    const currentPriorityFields = formValues.priorityFields || []
    const method = formValues.allocationMethod || ALLOCATION_METHODS.BY_PRIORITY
    
    if (!Array.isArray(currentPriorityFields) || currentPriorityFields.length === 0) {
      return []
    }
    
    if (!parsedArticles || parsedArticles.length === 0) {
      return []
    }
    
    return distributeArticles(
      currentPriorityFields,
      parsedArticles,
      ddnArticles,
      method,
      month,
      date
    )
  }, [formValues, ddnArticles, parsedArticles, month, date])

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

  // Build final allocation object
  // Using formValues ensures reactivity when nested array values change
  const finalAllocation = useMemo(() => {
    // Get current values from formValues to ensure we have latest values
    const currentPriorityFields = formValues.priorityFields || []
    const currentDdnArticles = ddnArticles
    const currentMethod = formValues.allocationMethod || ""
    
    return buildFinalAllocation(
      currentPriorityFields,
      parsedArticles,
      currentDdnArticles,
      currentMethod,
      month,
      date
    )
  }, [formValues, ddnArticles, parsedArticles, month, date])

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
  }, [watch, effectiveTotalFiles])

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
    displayArticles,
    finalAllocation,
    hasAllocations,
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    onSubmit,
  }
}


