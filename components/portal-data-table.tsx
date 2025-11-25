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
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

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


const columns: ColumnDef<PortalData>[] = [
  {
    accessorKey: "client",
    header: ({ column }) => createSortableHeader(column, "Client"),
    cell: ({ row }) => <div>{row.getValue("client")}</div>,
  },
  {
    accessorKey: "journal",
    header: ({ column }) => createSortableHeader(column, "Journal"),
    cell: ({ row }) => <div>{row.getValue("journal")}</div>,
  },
  {
    accessorKey: "articleId",
    header: ({ column }) => createSortableHeader(column, "Article ID"),
    cell: ({ row }) => <div>{row.getValue("articleId")}</div>,
  },
  {
    accessorKey: "src",
    header: ({ column }) => createSortableHeader(column, "SRC"),
    cell: ({ row }) => <div>{row.getValue("src")}</div>,
  },
  {
    accessorKey: "msp",
    header: ({ column }) => createSortableHeader(column, "MSP"),
    cell: ({ row }) => <div>{row.getValue("msp")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => createSortableHeader(column, "Status"),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      if (!status || status.trim() === "") {
        return <div className="text-muted-foreground">-</div>
      }
      return <div>{status}</div>
    },
  },
  {
    accessorKey: "assignDate",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader(column, "Assign Date")}
      </div>
    ),
    cell: ({ row }) => <div className="text-right">{row.getValue("assignDate")}</div>,
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <div className="text-right">
        {createSortableHeader(column, "Due Date")}
      </div>
    ),
    cell: ({ row }) => <div className="text-right">{row.getValue("dueDate")}</div>,
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
          <span className={`px-2 py-1 text-xs font-medium rounded ${bgColor}`}>
            {priority || "-"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "doneBy",
    header: ({ column }) => createSortableHeader(column, "Done By"),
    cell: ({ row }) => {
      const doneBy = row.getValue("doneBy") as string | null
      return <div>{doneBy || "-"}</div>
    },
  },
]

interface PortalDataTableProps {
  data: PortalData[]
  globalFilter: string
}

export function PortalDataTable({ data, globalFilter }: PortalDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
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
    },
  })

  const filteredRows = table.getFilteredRowModel().rows.length
  const totalRows = data.length

  return (
    <div className="rounded-b-md border-x border-b w-full">
      <div className="overflow-x-auto w-full">
        <Table className="w-full min-w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted group">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={`hover:bg-muted/50 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
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
      </div>
    </div>
  )
}
