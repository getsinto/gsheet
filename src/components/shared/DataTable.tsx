"use client"

import React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { LoadingSkeleton } from "./LoadingSkeleton"
import { EmptyState } from "./EmptyState"

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  selectableRows?: boolean
  onSelectionChange?: (rows: TData[]) => void
  page?: number
  perPage?: number
  total?: number
  onPageChange?: (p: number) => void
  onPerPageChange?: (pp: number) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<TData, TValue>({ columns, data, loading, selectableRows, onSelectionChange, page, perPage, total, onPageChange, onPerPageChange, emptyTitle = "No data", emptyDescription = "There is nothing to display." }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: selectableRows,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  })

  React.useEffect(()=>{
    if (!selectableRows || !onSelectionChange) return
    const selected = table.getSelectedRowModel().rows.map(r=> r.original as TData)
    onSelectionChange(selected)
  }, [rowSelection])

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {selectableRows && (
                <TableHead className="w-8">
                  <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(v)=>table.toggleAllPageRowsSelected(!!v)}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    <button className="inline-flex items-center gap-1" onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: "▲", desc: "▼" }[header.column.getIsSorted() as string] ?? null}
                    </button>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={columns.length + (selectableRows? 1:0)}><LoadingSkeleton variant="table" lines={5} /></TableCell></TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {selectableRows && (
                  <TableCell className="w-8">
                    <Checkbox checked={row.getIsSelected()} onCheckedChange={(v)=>row.toggleSelected(!!v)} aria-label="Select row" />
                  </TableCell>
                )}
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (selectableRows? 1:0)}>
                <EmptyState title={emptyTitle} description={emptyDescription} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Pagination controls */}
      {(page && perPage && total && onPageChange) ? (
        <div className="flex items-center justify-between gap-2 p-2">
          <div className="text-sm text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(total/perPage))}</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page<=1} onClick={()=>onPageChange(page-1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page>=Math.ceil(total/perPage)} onClick={()=>onPageChange(page+1)}>Next</Button>
            {onPerPageChange && (
              <select className="rounded border bg-background p-1 text-sm" value={perPage} onChange={(e)=>onPerPageChange(Number(e.target.value))}>
                {[10,20,30,50].map(n=> <option key={n} value={n}>{n}/page</option>)}
              </select>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
