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
import { LastTwoDaysFileData } from "@/hooks/use-last-two-days-files-data"
import { ArrowUpDown, ArrowUp, ArrowDown, Columns } from "lucide-react"
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
  column: Column<LastTwoDaysFileData, unknown>,
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

const columns: ColumnDef<LastTwoDaysFileData>[] = [
  {
    accessorKey: "row_number",
    header: ({ column }) => createSortableHeader(column, "Row #"),
    cell: ({ row }) => <div className="text-center">{row.getValue("row_number")}</div>,
    size: 80,
  },
  {
    accessorKey: "Month",
    header: ({ column }) => createSortableHeader(column, "Month"),
    cell: ({ row }) => <div>{row.getValue("Month")}</div>,
    size: 100,
  },
  {
    accessorKey: "Date",
    header: ({ column }) => createSortableHeader(column, "Date"),
    cell: ({ row }) => <div>{row.getValue("Date")}</div>,
    size: 120,
  },
  {
    accessorKey: "Article number",
    header: ({ column }) => createSortableHeader(column, "Article Number"),
    cell: ({ row }) => <div>{row.getValue("Article number")}</div>,
    size: 150,
  },
  {
    accessorKey: "Pages",
    header: ({ column }) => createSortableHeader(column, "Pages"),
    cell: ({ row }) => <div className="text-center">{row.getValue("Pages")}</div>,
    size: 80,
  },
  {
    accessorKey: "Completed",
    header: ({ column }) => createSortableHeader(column, "Completed"),
    cell: ({ row }) => {
      const completed = (row.getValue("Completed") as string) || ""
      const completedLower = completed.toLowerCase()
      let bgColor = "bg-gray-100 text-gray-700"
      if (completedLower === "completed" || completedLower.includes("done")) {
        bgColor = "bg-green-100 text-green-700"
      } else if (completedLower === "not started" || completedLower.includes("not")) {
        bgColor = "bg-red-100 text-red-700"
      } else if (completedLower.includes("in progress") || completedLower.includes("progress")) {
        bgColor = "bg-yellow-100 text-yellow-700"
      }
      return (
        <div>
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md h-6 ${bgColor}`}>
            {completed || "-"}
          </span>
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: "Done by",
    header: ({ column }) => createSortableHeader(column, "Done By"),
    cell: ({ row }) => {
      const doneBy = row.getValue("Done by") as string | null
      return <div>{doneBy || "-"}</div>
    },
    size: 120,
  },
  {
    accessorKey: "Time",
    header: ({ column }) => createSortableHeader(column, "Time"),
    cell: ({ row }) => {
      const time = row.getValue("Time") as string
      return <div>{time || "-"}</div>
    },
    size: 100,
  },
]

interface PeopleDataTableProps {
  data: LastTwoDaysFileData[]
  globalFilter: string
  onColumnsChange?: (visibility: VisibilityState) => void
}

export function PeopleDataTable({ data, globalFilter, onColumnsChange }: PeopleDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    row_number: true,
    Month: true,
    Date: true,
    "Article number": true,
    Pages: true,
    Completed: true,
    "Done by": true,
    Time: true,
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
        original.row_number,
        original.Month,
        original.Date,
        original["Article number"],
        original.Pages,
        original.Completed,
        original["Done by"],
        original.Time,
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
    row_number: "Row #",
    Month: "Month",
    Date: "Date",
    "Article number": "Article Number",
    Pages: "Pages",
    Completed: "Completed",
    "Done by": "Done By",
    Time: "Time",
  }

  return (
    <div className="rounded-b-md border-x border-b w-full overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full" style={{ minWidth: "max-content" }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted group">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="px-4 py-3">
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
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`hover:bg-muted/50 cursor-default transition-colors ${
                    index % 2 === 0 
                      ? "bg-background" 
                      : "bg-muted/20"
                  }`}
                >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell 
                      key={cell.id}
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

