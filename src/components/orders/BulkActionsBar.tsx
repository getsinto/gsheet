"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Trash2, Download, ChevronDown, CheckCircle2 } from "lucide-react"
import { toast } from "react-hot-toast"

export function BulkActionsBar({ selectedIds, onDone }: { selectedIds: string[]; onDone: () => void }) {
  const [loading, setLoading] = useState<string | null>(null)

  const count = selectedIds.length

  const bulk = async (action: string, body: Record<string, any>) => {
    try {
      setLoading(action)
      const res = await fetch(`/api/orders/bulk?action=${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(await res.text())
      toast.success('Bulk action completed')
      onDone()
    } catch (e: any) {
      toast.error('Bulk action failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="sticky top-16 z-10 rounded-lg border bg-white p-3 shadow-sm dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm"><strong>{count}</strong> orders selected</div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1" disabled={!!loading}>
                Actions <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => bulk('update-status', { order_ids: selectedIds, status: 'dispatched' })}><CheckCircle2 className="mr-2 h-4 w-4" /> Change Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => bulk('assign-driver', { order_ids: selectedIds, driver_id: '00000000-0000-0000-0000-000000000000', driver_name: 'Driver' })}><Users className="mr-2 h-4 w-4" /> Assign Driver</DropdownMenuItem>
              <DropdownMenuItem onClick={() => bulk('delete', { order_ids: selectedIds })} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete Selected</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/api/export/orders?ids=${selectedIds.join(',')}`} className="flex items-center"><Download className="mr-2 h-4 w-4" /> Export Selected</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
