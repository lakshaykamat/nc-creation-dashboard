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
import { type PriorityField, ALLOCATION_METHODS, createInitialPriorityFields } from "@/lib/file-allocator-constants"
import {
  parseNewArticlesWithPages,
  validateDdnArticles,
  calculateAllocatedFiles,
  calculateRemainingFiles,
  isOverAllocated,
  getOverAllocationMessage,
  type ParsedArticle,
} from "@/lib/file-allocator-utils"

/**
 * Form values structure for Article Allocation Form
 */
export interface FormValues {
  allocationMethod: string
  ddnArticles: string
  priorityFields: PriorityField[]
}

/**
 * Represents an article allocated to a person or DDN.
 */
export interface AllocatedArticle {
  /** Name of the person or "DDN" for DDN articles */
  name: string
  /** Article identifier */
  articleId: string
  /** Number of pages */
  pages: number
}

/**
 * Represents articles allocated to a specific person.
 */
export interface PersonAllocation {
  /** Person name */
  person: string
  /** Array of articles allocated to this person */
  articles: Array<{
    articleId: string
    pages: number
  }>
}

/**
 * Final allocation result structure for form submission.
 */
export interface FinalAllocationResult {
  /** Articles grouped by person */
  personAllocations: PersonAllocation[]
  /** DDN articles with pages */
  ddnArticles: Array<{
    articleId: string
    pages: number
  }>
  /** Articles that were not allocated to anyone */
  unallocatedArticles: Array<{
    articleId: string
    pages: number
  }>
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
      priorityFields: createInitialPriorityFields(),
    },
  })

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
  
  // Track previous allocation method for reset logic
  const prevAllocationMethodRef = useRef<string>("")

  // Watch form values - use watch() to ensure reactivity for nested arrays
  // Watching all fields ensures nested array changes are detected
  const formValues = watch()
  const allocationMethod = formValues.allocationMethod || ""
  const textareaValue = formValues.ddnArticles || ""
  const priorityFields = formValues.priorityFields || []

  // Parse articles from input data
  const parsedArticles = useMemo(
    () => parseNewArticlesWithPages(newArticlesWithPages),
    [newArticlesWithPages]
  )

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
      method
    )
  }, [formValues, ddnArticles, parsedArticles])

  // Get unallocated articles for display
  const allocatedArticleIds = useMemo(
    () => new Set(allocatedArticles.map((a) => a.articleId)),
    [allocatedArticles]
  )

  const unallocatedArticles = useMemo(() => {
    const unallocated = parsedArticles
      .filter((article) => !allocatedArticleIds.has(article.articleId))
      .map((article) => ({
        name: "NEED TO ALLOCATE",
        articleId: article.articleId,
        pages: article.pages,
      }))

    // Sort unallocated articles based on allocation method
    const normalizedMethod = allocationMethod?.toLowerCase().trim() || ""
    const isAllocateByPages = normalizedMethod === "allocate by pages"
    
    if (isAllocateByPages) {
      return [...unallocated].sort((a, b) => b.pages - a.pages)
    }
    
    return unallocated
  }, [parsedArticles, allocatedArticleIds, allocationMethod])

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
      currentMethod
    )
  }, [formValues, ddnArticles, parsedArticles])

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

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    const submissionAllocation = buildFinalAllocation(
      values.priorityFields,
      parsedArticles,
      ddnArticles,
      values.allocationMethod
    )
    
    // TODO: Implement actual form submission
    console.log("Final Allocation:", submissionAllocation)
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

/**
 * BUSINESS LOGIC FUNCTIONS
 * 
 * These functions contain the core business logic for article allocation.
 * They implement the allocation rules and distribution algorithms.
 */

/**
 * Distributes articles to people based on allocation method and priority fields.
 * 
 * Allocation rules:
 * 1. DDN articles are always allocated first (top priority)
 * 2. DDN articles are never allocated to people (no double-assignment)
 * 3. Remaining articles are allocated based on the selected method:
 *    - "allocate by pages": Allocates N largest articles (by page count) to each person
 *    - "allocate by priority": Allocates first N available articles in order
 * 4. Each article is only allocated once (no duplicates)
 * 
 * @param priorityFields - Array of priority fields with allocation counts
 * @param parsedArticles - Array of parsed articles to distribute
 * @param ddnArticles - Array of DDN article IDs (already allocated)
 * @param allocationMethod - Allocation method ("allocate by pages" or "allocate by priority")
 * @returns Array of allocated articles with person/DDN name
 */
function distributeArticles(
  priorityFields: PriorityField[],
  parsedArticles: ParsedArticle[],
  ddnArticles: string[],
  allocationMethod: string
): AllocatedArticle[] {
  const result: AllocatedArticle[] = []

  // Early return if no articles
  if (!parsedArticles || parsedArticles.length === 0) {
    return []
  }

  const ddnSet = new Set(ddnArticles)

  // 1) DDN rows (top priority)
  const ddnRows: AllocatedArticle[] = parsedArticles
    .filter((article) => ddnSet.has(article.articleId))
    .map((article) => ({
      name: "DDN",
      articleId: article.articleId,
      pages: article.pages,
    }))

  // 2) Remaining articles available for people allocation
  let availableArticles = parsedArticles.filter(
    (article) => !ddnSet.has(article.articleId)
  )

  // Normalize allocation method for comparison
  // Default to priority if method is empty or invalid
  const normalizedMethod = (allocationMethod?.toLowerCase().trim() || "allocate by priority")
  const isAllocateByPages = normalizedMethod === "allocate by pages"

  // When allocating by pages, sort articles by pages (descending - highest first)
  if (isAllocateByPages) {
    availableArticles = [...availableArticles].sort((a, b) => b.pages - a.pages)
  }

  // Track which articles have been assigned to avoid duplicates
  const assignedArticleIds = new Set<string>()

  // Iterate through priority fields in order
  for (const field of priorityFields) {
    const rawValue = field?.value || 0

    if (rawValue <= 0) continue

    if (isAllocateByPages) {
      // Treat value as count of largest articles to allocate
      // Articles are already sorted by pages (descending) when isAllocateByPages is true
      const count = rawValue
      let articlesAllocated = 0

      for (const article of availableArticles) {
        if (assignedArticleIds.has(article.articleId)) {
          continue
        }

        if (articlesAllocated < count) {
          result.push({
            name: field.label,
            articleId: article.articleId,
            pages: article.pages,
          })
          assignedArticleIds.add(article.articleId)
          articlesAllocated++
        }

        if (articlesAllocated >= count) {
          break
        }
      }
    } else {
      // Default / priority mode: treat value as article count
      let articlesAllocated = 0

      for (const article of availableArticles) {
        if (assignedArticleIds.has(article.articleId)) {
          continue
        }

        result.push({
          name: field.label,
          articleId: article.articleId,
          pages: article.pages,
        })
        assignedArticleIds.add(article.articleId)
        articlesAllocated++

        if (articlesAllocated >= rawValue) {
          break
        }
      }
    }
  }
  
  // DDN first, then person allocations
  return [...ddnRows, ...result]
}

/**
 * Builds the final allocation object from form data for submission.
 * 
 * This function:
 * - Groups articles by person name
 * - Separates DDN articles into their own array
 * - Identifies unallocated articles
 * 
 * @param priorityFields - Array of priority fields with allocation counts
 * @param parsedArticles - Array of all parsed articles
 * @param ddnArticles - Array of DDN article IDs
 * @param allocationMethod - Allocation method used
 * @returns Final allocation object ready for submission
 */
function buildFinalAllocation(
  priorityFields: PriorityField[],
  parsedArticles: ParsedArticle[],
  ddnArticles: string[],
  allocationMethod: string
): FinalAllocationResult {
  const ddnSet = new Set(ddnArticles)
  
  // Get DDN articles with pages
  const ddnArticlesWithPages = parsedArticles
    .filter((article) => ddnSet.has(article.articleId))
    .map((article) => ({
      articleId: article.articleId,
      pages: article.pages,
    }))

  // Get allocated articles
  const allocatedArticles = distributeArticles(
    priorityFields,
    parsedArticles,
    ddnArticles,
    allocationMethod
  )

  // Get all allocated article IDs (DDN + person allocations)
  const allocatedArticleIds = new Set(
    allocatedArticles.map((a) => a.articleId)
  )

  // Find unallocated articles
  const unallocatedArticles = parsedArticles
    .filter((article) => !allocatedArticleIds.has(article.articleId))
    .map((article) => ({
      articleId: article.articleId,
      pages: article.pages,
    }))

  // Group person allocations by person name
  const personMap = new Map<string, Array<{ articleId: string; pages: number }>>()
  
  for (const allocated of allocatedArticles) {
    // Skip DDN articles
    if (allocated.name === "DDN") continue
    
    if (!personMap.has(allocated.name)) {
      personMap.set(allocated.name, [])
    }
    personMap.get(allocated.name)!.push({
      articleId: allocated.articleId,
      pages: allocated.pages,
    })
  }

  // Convert map to array
  const personAllocations: PersonAllocation[] = Array.from(personMap.entries()).map(
    ([person, articles]) => ({
      person,
      articles,
    })
  )

  return {
    personAllocations,
    ddnArticles: ddnArticlesWithPages,
    unallocatedArticles,
  }
}

