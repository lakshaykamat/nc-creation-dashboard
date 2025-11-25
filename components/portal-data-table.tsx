"use client"

import { useState } from "react"
import {
  ColumnDef,
  Column,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PortalData } from "@/hooks/use-portal-data"
import { ArrowUpDown, ArrowUp, ArrowDown, Columns, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const createSortableHeader = (
  column: Column<PortalData, unknown>,
  label: string
) => {
  const isSorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(isSorted === "asc")}
      className="h-8 px-2 -ml-2 hover:bg-muted/50"
    >
      {label}
      {isSorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4 text-primary" />
      ) : isSorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4 text-primary" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </Button>
  )
}


// Helper function to format dates
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-"
  try {
    // Parse DD/MM/YYYY HH:MM AM/PM format
    const [datePart, timePart] = dateStr.split(" ")
    if (!datePart) return dateStr
    
    const [day, month, year] = datePart.split("/")
    if (!day || !month || !year) return dateStr
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthName = monthNames[parseInt(month) - 1] || month
    
    const time = timePart ? `, ${timePart}` : ""
    return `${day} ${monthName} ${year}${time}`
  } catch {
    return dateStr
  }
}

const columns: ColumnDef<PortalData>[] = [
  {
    accessorKey: "client",
    header: ({ column }) => createSortableHeader(column, "Client"),
    cell: ({ row }) => <div>{row.getValue("client")}</div>,
    size: 80,
  },
  {
    accessorKey: "journal",
    header: ({ column }) => createSortableHeader(column, "Journal"),
    cell: ({ row }) => <div>{row.getValue("journal")}</div>,
    size: 100,
  },
  {
    accessorKey: "articleId",
    header: ({ column }) => createSortableHeader(column, "Article ID"),
    cell: ({ row }) => {
      const articleId = row.getValue("articleId") as string
      const downloadUrl = `https://powertrack3.aptaracorp.com/AptaraVendorAPI/downloadfile.html?clientReference=${encodeURIComponent(articleId)}&ipaddress=powertrack3.aptaracorp.com&username=cedit&password=cedit&basepath=/CEFTP/VEND/XMLREVIEW&clientid=1722`
      
      return (
        <div className="flex items-center justify-between">
          <span>{articleId}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              window.open(downloadUrl, "_blank")
            }}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            title={`Download file for ${articleId}`}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    },
    size: 140,
  },
  {
    accessorKey: "src",
    header: ({ column }) => createSortableHeader(column, "SRC"),
    cell: ({ row }) => <div>{row.getValue("src")}</div>,
    size: 70,
  },
  {
    accessorKey: "msp",
    header: ({ column }) => createSortableHeader(column, "MSP"),
    cell: ({ row }) => <div>{row.getValue("msp")}</div>,
    size: 70,
  },
  {
    accessorKey: "status",
    header: ({ column }) => createSortableHeader(column, "Status"),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const isInQA = row.original.isInQA === true
      return (
        <div className="flex items-center gap-2">
          {isInQA && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-yellow-200 text-yellow-800 whitespace-nowrap">
              Pending QA Validation
            </span>
          )}
          <span>{status || "-"}</span>
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: "assignDate",
    header: ({ column }) => {
      const HeaderButton = () => createSortableHeader(column, "Assign Date")
      return (
        <div className="flex justify-end w-full">
          <HeaderButton />
        </div>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("assignDate") as string
      return <div className="text-right text-sm whitespace-nowrap">{formatDate(date)}</div>
    },
    size: 160,
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      const HeaderButton = () => createSortableHeader(column, "Due Date")
      return (
        <div className="flex justify-end w-full">
          <HeaderButton />
        </div>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("dueDate") as string
      return <div className="text-right text-sm whitespace-nowrap">{formatDate(date)}</div>
    },
    size: 160,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => createSortableHeader(column, "Priority"),
    cell: ({ row }) => {
      const priority = (row.getValue("priority") as string) || ""
      const priorityLower = priority.toLowerCase()
      let bgColor = "bg-gray-100 text-gray-700"
      if (priorityLower === "high") {
        bgColor = "bg-red-100 text-red-700"
      } else if (priorityLower === "low") {
        bgColor = "bg-green-100 text-green-700"
      } else if (priorityLower.includes("medium") || priorityLower.includes("mid")) {
        bgColor = "bg-yellow-100 text-yellow-700"
      }
      return (
        <div>
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md h-6 ${bgColor}`}>
            {priority || "-"}
          </span>
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: "doneBy",
    header: ({ column }) => createSortableHeader(column, "Done By"),
    cell: ({ row }) => {
      const doneBy = row.getValue("doneBy") as string | null
      return <div>{doneBy || "-"}</div>
    },
    size: 120,
  },
]

interface PortalDataTableProps {
  data: PortalData[]
  globalFilter: string
  onColumnsChange?: (visibility: VisibilityState) => void
}

export function PortalDataTable({ data, globalFilter, onColumnsChange }: PortalDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    client: false,
    journal: true,
    articleId: true,
    src: true,
    msp: false,
    status: false,
    assignDate: false,
    dueDate: false,
    priority: true,
    doneBy: true,
  })

  const handleColumnVisibilityChange = (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
    const newVisibility = typeof updater === "function" ? updater(columnVisibility) : updater
    setColumnVisibility(newVisibility)
    if (onColumnsChange) {
      onColumnsChange(newVisibility)
    }
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    columnResizeMode: "onChange",
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue || "").toLowerCase()
      const original = row.original
      
      const fields = [
        original.client,
        original.journal,
        original.articleId,
        original.src,
        original.msp,
        original.status,
        original.assignDate,
        original.dueDate,
        original.priority,
        original.doneBy,
      ]
      
      return fields.some((field) => 
        String(field || "").toLowerCase().includes(searchValue)
      )
    },
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
  })

  const filteredRows = table.getFilteredRowModel().rows.length
  const totalRows = data.length

  const columnLabels: Record<string, string> = {
    client: "Client",
    journal: "Journal",
    articleId: "Article ID",
    src: "SRC",
    msp: "MSP",
    status: "Status",
    assignDate: "Assign Date",
    dueDate: "Due Date",
    priority: "Priority",
    doneBy: "Done By",
  }

  return (
    <div className="rounded-md border-x border-b w-full overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full" style={{ minWidth: "max-content" }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted group">
              {headerGroup.headers.map((header, index) => {
                // Add visual separators between column groups
                const isGroupEnd = index === 2 || index === 5 || index === 7
                return (
                  <TableHead 
                    key={header.id}
                    className={isGroupEnd ? "border-r border-border/40 pr-3" : ""}
                    style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => {
              const isInQA = row.original.isInQA === true
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`group hover:bg-muted/50 cursor-default transition-colors ${
                    isInQA 
                      ? "bg-yellow-50 hover:bg-yellow-100" 
                      : index % 2 === 0 
                        ? "bg-background" 
                        : "bg-muted/20"
                  }`}
                >
                {row.getVisibleCells().map((cell) => {
                  const visibleColumns = table.getVisibleLeafColumns()
                  const currentColumnIndex = visibleColumns.findIndex(col => col.id === cell.column.id)
                  // Adjust group end positions based on visible columns
                  const isGroupEnd = currentColumnIndex === 1 || currentColumnIndex === 2 || currentColumnIndex === 3
                  return (
                    <TableCell 
                      key={cell.id}
                      className={isGroupEnd ? "border-r border-border/20 pr-3" : ""}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
        <span>
          Showing {filteredRows} of {totalRows} {totalRows === 1 ? "row" : "rows"}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {columnLabels[column.id] || column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
