"use client"

import React from "react"
import { Button } from "@/components/ui/button"

export type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  perPage?: number
  onPerPageChange?: (pp: number) => void
  totalItems?: number
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, perPage, onPerPageChange, totalItems, className = "" }: PaginationProps) {
  const pages = getPages(currentPage, totalPages)

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="text-sm text-muted-foreground">
        {totalItems !== undefined && perPage !== undefined ? renderRange(currentPage, perPage, totalItems) : null}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={currentPage<=1} onClick={()=>onPageChange(1)}>{"«"}</Button>
        <Button size="sm" variant="outline" disabled={currentPage<=1} onClick={()=>onPageChange(currentPage-1)}>{"‹"}</Button>
        {pages.map((p,i)=> p==='...' ? (
          <span key={`e${i}`} className="px-2 text-muted-foreground">…</span>
        ) : (
          <Button key={p} size="sm" variant={p===currentPage? 'default':'outline'} onClick={()=>onPageChange(p as number)}>{p}</Button>
        ))}
        <Button size="sm" variant="outline" disabled={currentPage>=totalPages} onClick={()=>onPageChange(currentPage+1)}>{"›"}</Button>
        <Button size="sm" variant="outline" disabled={currentPage>=totalPages} onClick={()=>onPageChange(totalPages)}>{"»"}</Button>
        {onPerPageChange && (
          <select className="ml-2 rounded border bg-background p-1 text-sm" value={perPage} onChange={(e)=>onPerPageChange(Number(e.target.value))}>
            {[10,20,30,50,100].map(n=> <option key={n} value={n}>{n}/page</option>)}
          </select>
        )}
      </div>
    </div>
  )
}

function getPages(current: number, total: number): (number|"...")[] {
  const delta = 1
  const range: number[] = []
  const rangeWithDots: (number|"...")[] = []
  const l = 1
  const r = total
  for (let i = Math.max(2, current - delta); i <= Math.min(r - 1, current + delta); i++) range.push(i)
  if (current - delta > 2) range.unshift(NaN as any)
  if (current + delta < r - 1) range.push(NaN as any)
  range.unshift(l)
  if (r !== l) range.push(r)
  let prev: number | undefined
  for (const n of range) {
    if (Number.isNaN(n)) {
      rangeWithDots.push('...')
    } else {
      if (!prev || n - prev === 1) {
        rangeWithDots.push(n)
      } else {
        rangeWithDots.push('...', n)
      }
      prev = n
    }
  }
  return rangeWithDots
}

function renderRange(page: number, perPage: number, total: number) {
  const start = (page - 1) * perPage + 1
  const end = Math.min(total, page * perPage)
  return `Showing ${start}-${end} of ${total} items`
}
