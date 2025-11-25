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
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-8 px-2 -ml-2"
    >
      {label}
      {column.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
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
    cell: ({ row }) => <div className="font-medium">{row.getValue("articleId")}</div>,
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
      return <div>{status || "-"}</div>
    },
  },
  {
    accessorKey: "assignDate",
    header: ({ column }) => createSortableHeader(column, "Assign Date"),
    cell: ({ row }) => <div>{row.getValue("assignDate")}</div>,
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => createSortableHeader(column, "Due Date"),
    cell: ({ row }) => <div>{row.getValue("dueDate")}</div>,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => createSortableHeader(column, "Priority"),
    cell: ({ row }) => <div>{row.getValue("priority")}</div>,
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
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted">
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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
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
