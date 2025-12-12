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

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useForm, useFieldArray, useWatch, type Control, type UseFormWatch, type UseFormSetValue } from "react-hook-form"
import { type PriorityField, ALLOCATION_METHODS } from "@/lib/constants/file-allocator-constants"
import { useTeamMembers } from "./use-team-members"
import { parseNewArticlesWithPages } from "@/lib/file-allocator/articles/parse-article-utils"
import { getOverAllocationMessage } from "@/lib/file-allocator/allocation/allocation-message-utils"
import { buildFinalAllocation } from "@/lib/file-allocator/allocation/allocation-result-utils"
import { hasPriorityFieldsChanged } from "@/lib/file-allocator/priority/priority-fields-comparison-utils"
import { transformTeamMembersToPriorityFields } from "@/lib/file-allocator/priority/priority-fields-transformation-utils"
import { getCurrentMonthAndDate } from "@/lib/common/date-utils"
import { savePriorityOrder, loadPriorityOrder } from "@/lib/file-allocator/priority/priority-order-storage-utils"
import { reorderPriorityFields, extractPriorityOrder } from "@/lib/file-allocator/priority/priority-order-utils"
import { previewAllocation, validateAllocation, submitAllocation } from "@/lib/api/allocations-api"
import { parsePastedAllocation as parsePastedAllocationApi } from "@/lib/api/articles-api"
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
  manuallyAddedArticleIds: Set<string>
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
  handleUpdateFromPastedData: (pastedText: string) => Promise<{ success: boolean; message: string }>
  handleDeleteArticle: (articleId: string) => void
  handleUpdateArticle: (articleId: string, field: keyof AllocatedArticle, value: string | number) => void
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
  
  // Manually added articles from preview dialog
  const [manuallyAddedArticles, setManuallyAddedArticles] = useState<ParsedArticle[]>([])
  
  // Track deleted article IDs
  const [deletedArticleIds, setDeletedArticleIds] = useState<Set<string>>(new Set())
  
  // Track updated article data (articleId -> ParsedArticle with updates)
  const [updatedArticles, setUpdatedArticles] = useState<Map<string, Partial<ParsedArticle>>>(new Map())
  
  // Track overrides for display fields (month, date, name) per article
  const [articleDisplayOverrides, setArticleDisplayOverrides] = useState<Map<string, Partial<Pick<AllocatedArticle, "month" | "date" | "name">>>>(new Map())
  
  // API computation results state
  const [validationResult, setValidationResult] = useState<{
    allocatedFiles: number
    remainingFiles: number
    isOverAllocated: boolean
    ddnValidationError: string | null
  } | null>(null)
  const [previewResult, setPreviewResult] = useState<{
    allocatedArticles: AllocatedArticle[]
    unallocatedArticles: AllocatedArticle[]
    displayArticles: AllocatedArticle[]
  } | null>(null)
  const [isComputing, setIsComputing] = useState(false)
  
  // Track previous allocation method for reset logic
  const prevAllocationMethodRef = useRef<string>("")

  // Watch specific form fields for better reactivity using useWatch for nested arrays
  const allocationMethod = useWatch({ control, name: "allocationMethod" }) || ""
  const textareaValue = useWatch({ control, name: "ddnArticles" }) || ""
  const priorityFields = useWatch({ control, name: "priorityFields" }) || []

  // Parse articles from input data
  const parsedArticlesFromInput = useMemo(() => {
    return parseNewArticlesWithPages(newArticlesWithPages)
  }, [newArticlesWithPages])

  // Merge parsed articles with manually added articles and apply updates/deletes
  // Manually added articles take precedence (replace duplicates by articleId)
  const parsedArticles = useMemo(() => {
    const articleMap = new Map<string, ParsedArticle>()
    
    // Add parsed articles from input first (excluding deleted ones)
    parsedArticlesFromInput.forEach(article => {
      if (!deletedArticleIds.has(article.articleId)) {
        articleMap.set(article.articleId, article)
      }
    })
    
    // Override with manually added articles (excluding deleted ones)
    manuallyAddedArticles.forEach(article => {
      if (!deletedArticleIds.has(article.articleId)) {
        articleMap.set(article.articleId, article)
      }
    })
    
    // Apply updates to existing articles
    updatedArticles.forEach((updates, articleId) => {
      const existing = articleMap.get(articleId)
      if (existing) {
        articleMap.set(articleId, { ...existing, ...updates } as ParsedArticle)
      }
    })
    
    return Array.from(articleMap.values())
  }, [parsedArticlesFromInput, manuallyAddedArticles, deletedArticleIds, updatedArticles])

  // Get available article IDs for DDN validation
  const availableArticleIds = useMemo(
    () => parsedArticles.map((item) => item.articleId),
    [parsedArticles]
  )

  // Set of manually added article IDs for preview highlighting
  const manuallyAddedArticleIds = useMemo(
    () => new Set(manuallyAddedArticles.map(article => article.articleId)),
    [manuallyAddedArticles]
  )

  // Total files count
  const totalFiles = parsedArticles.length

  // Get current date and month for allocation
  const { month, date } = useMemo(() => getCurrentMonthAndDate(), [])

  // Extract DDN articles from textarea (simple parsing for client-side)
  const ddnArticles = useMemo(() => {
    return textareaValue
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  }, [textareaValue])

  // Effective total files (excluding DDN articles)
  const ddnArticleCount = ddnArticles.length
  const effectiveTotalFiles = Math.max(totalFiles - ddnArticleCount, 0)

  // Compute validation and preview via API
  useEffect(() => {
    if (!priorityFields || priorityFields.length === 0 || !parsedArticles || parsedArticles.length === 0) {
      setValidationResult({
        allocatedFiles: 0,
        remainingFiles: effectiveTotalFiles,
        isOverAllocated: false,
        ddnValidationError: null,
      })
      setPreviewResult({
        allocatedArticles: [],
        unallocatedArticles: [],
        displayArticles: [],
      })
      return
    }

    let cancelled = false
    setIsComputing(true)

    const computeAsync = async () => {
      try {
        // Compute validation and preview in parallel
        const [validationResponse, previewResponse] = await Promise.all([
          validateAllocation({
            priorityFields,
            totalFiles: effectiveTotalFiles,
            ddnArticles,
            availableArticleIds,
            ddnText: textareaValue,
          }),
          previewAllocation({
            priorityFields,
            parsedArticles,
            ddnArticles,
            allocationMethod: allocationMethod || ALLOCATION_METHODS.BY_PRIORITY,
            month,
            date,
            articleDisplayOverrides: Object.fromEntries(articleDisplayOverrides),
          }),
        ])

        if (cancelled) return

        setValidationResult({
          allocatedFiles: validationResponse.allocatedFiles,
          remainingFiles: validationResponse.remainingFiles,
          isOverAllocated: validationResponse.isOverAllocated,
          ddnValidationError: validationResponse.ddnValidationError,
        })

        // Apply display overrides on top of API result
        let displayArticles = previewResponse.displayArticles
        if (articleDisplayOverrides.size > 0) {
          displayArticles = displayArticles.map((article) => {
            const override = articleDisplayOverrides.get(article.articleId)
            if (override) {
              return { ...article, ...override }
            }
            return article
          })
        }

        setPreviewResult({
          allocatedArticles: previewResponse.allocatedArticles,
          unallocatedArticles: previewResponse.unallocatedArticles,
          displayArticles,
        })
      } catch (error) {
        console.error("Error computing allocation:", error)
        if (!cancelled) {
          // Fallback to empty results on error
          setValidationResult({
            allocatedFiles: 0,
            remainingFiles: effectiveTotalFiles,
            isOverAllocated: false,
            ddnValidationError: "Error computing allocation",
          })
          setPreviewResult({
            allocatedArticles: [],
            unallocatedArticles: [],
            displayArticles: [],
          })
        }
      } finally {
        if (!cancelled) {
          setIsComputing(false)
        }
      }
    }

    computeAsync()

    return () => {
      cancelled = true
    }
  }, [
    priorityFields,
    parsedArticles,
    ddnArticles,
    allocationMethod,
    month,
    date,
    effectiveTotalFiles,
    availableArticleIds,
    textareaValue,
    articleDisplayOverrides,
  ])

  // Use API results or fallback values
  const allocatedFiles = validationResult?.allocatedFiles ?? 0
  const remainingFiles = validationResult?.remainingFiles ?? effectiveTotalFiles
  const isOverAllocatedValue = validationResult?.isOverAllocated ?? false
  const ddnValidationError = validationResult?.ddnValidationError ?? null

  const allocatedArticles = previewResult?.allocatedArticles ?? []
  const unallocatedArticles = previewResult?.unallocatedArticles ?? []
  const displayArticles = previewResult?.displayArticles ?? []

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
    if (!validationResult) return

    if (validationResult.isOverAllocated) {
      const overBy = validationResult.allocatedFiles - effectiveTotalFiles
      setToastMessage(getOverAllocationMessage(overBy))
      setShowToast(true)
    } else {
      setShowToast(false)
    }
  }, [validationResult, effectiveTotalFiles, getOverAllocationMessage])

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
      const result = await submitAllocation(submissionAllocation)

      // Hide loading dialog
      setShowLoading(false)

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

  // Handler to update priority fields from pasted article data
  const handleUpdateFromPastedData = async (pastedText: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await parsePastedAllocationApi({ pastedText })
      const entries = response.entries
      
      if (entries.length === 0) {
        return {
          success: false,
          message: "No valid article data found. Format 'ATECH1232 12'",
        }
      }

      // Convert entries to ParsedArticle format and store as manually added
      const newManuallyAddedArticles: ParsedArticle[] = entries.map(entry => ({
        articleId: entry.articleId.toUpperCase().trim(),
        pages: entry.pages,
      }))
      
      // Update manually added articles (merge with existing, new ones override)
      setManuallyAddedArticles(prev => {
        const articleMap = new Map<string, ParsedArticle>()
        // Keep existing manually added articles
        prev.forEach(article => {
          articleMap.set(article.articleId, article)
        })
        // Add/override with new articles
        newManuallyAddedArticles.forEach(article => {
          articleMap.set(article.articleId, article)
        })
        return Array.from(articleMap.values())
      })
      
      // Remove from deleted set if it was previously deleted
      setDeletedArticleIds(prev => {
        const next = new Set(prev)
        newManuallyAddedArticles.forEach(article => {
          next.delete(article.articleId)
        })
        return next
      })

      // Manually added articles remain unallocated (NEED TO ALLOCATE)
      // Don't update priority fields - let user allocate them manually

      return {
        success: true,
        message: `Added ${entries.length} article${entries.length > 1 ? "s" : ""}.`,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to parse article data",
      }
    }
  }

  // Handler to delete an article
  const handleDeleteArticle = useCallback((articleId: string) => {
    setDeletedArticleIds(prev => new Set(prev).add(articleId))
    // Also remove from manually added articles if it's there
    setManuallyAddedArticles(prev => prev.filter(a => a.articleId !== articleId))
    // Remove from updated articles if it's there
    setUpdatedArticles(prev => {
      const next = new Map(prev)
      next.delete(articleId)
      return next
    })
    // Remove display overrides
    setArticleDisplayOverrides(prev => {
      const next = new Map(prev)
      next.delete(articleId)
      return next
    })
  }, [])

  // Handler to update an article field
  const handleUpdateArticle = useCallback((
    articleId: string,
    field: keyof AllocatedArticle,
    value: string | number
  ) => {
    // Map AllocatedArticle fields to ParsedArticle fields
    if (field === "pages") {
      const pages = typeof value === "number" ? value : parseInt(String(value), 10) || 0
      setUpdatedArticles(prev => {
        const next = new Map(prev)
        const existing = next.get(articleId) || {}
        next.set(articleId, { ...existing, pages } as Partial<ParsedArticle>)
        return next
      })
      // Also update in manually added articles if it exists there
      setManuallyAddedArticles(prev => {
        return prev.map(article => {
          if (article.articleId === articleId) {
            return { ...article, pages }
          }
          return article
        })
      })
    } else if (field === "articleId") {
      const newArticleId = String(value).toUpperCase().trim()
      // Find the article in manually added or check if it exists
      const existingArticle = parsedArticles.find(a => a.articleId === articleId)
      if (existingArticle) {
        // Remove old article ID from deletions/updates/overrides
        setDeletedArticleIds(prev => {
          const next = new Set(prev)
          next.delete(articleId)
          return next
        })
        setUpdatedArticles(prev => {
          const next = new Map(prev)
          next.delete(articleId)
          return next
        })
        // Migrate override to new article ID
        const override = articleDisplayOverrides.get(articleId)
        if (override) {
          setArticleDisplayOverrides(prev => {
            const next = new Map(prev)
            next.delete(articleId)
            next.set(newArticleId, override)
            return next
          })
        }
        // Add new article with new ID
        setManuallyAddedArticles(prev => {
          const filtered = prev.filter(a => a.articleId !== articleId)
          return [...filtered, { articleId: newArticleId, pages: existingArticle.pages }]
        })
      }
    } else if (field === "month" || field === "date" || field === "name") {
      // Store display overrides for computed fields
      setArticleDisplayOverrides(prev => {
        const next = new Map(prev)
        const existing = next.get(articleId) || {}
        next.set(articleId, { ...existing, [field]: String(value) })
        return next
      })
    }
  }, [parsedArticles])

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
    manuallyAddedArticleIds,
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
    handleUpdateFromPastedData,
    handleDeleteArticle,
    handleUpdateArticle,
    onSubmit,
  }
}


