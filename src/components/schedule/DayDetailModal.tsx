"use client"

import React, { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatFullDate } from "@/lib/utils/calendar"
import { toast } from "react-hot-toast"

export function DayDetailModal({ open, onOpenChange, dateISO, grouped, onChanged }: { open: boolean; onOpenChange: (v: boolean)=>void; dateISO?: string; grouped: Record<string, any[]>; onChanged: ()=>void }) {
  const orders = useMemo(() => (dateISO ? (grouped[dateISO] ?? []) : []), [dateISO, grouped])
  const date = dateISO ? new Date(dateISO) : undefined

  const update = async (id: string, checkbox_name: string, checkbox_value: boolean) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checkbox_name, checkbox_value }) })
      if (!res.ok) throw new Error(await res.text())
      toast.success('Updated')
      onChanged()
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-full max-w-3xl overflow-auto">
        <DialogHeader>
          <DialogTitle>{date ? formatFullDate(date) : 'Day'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-sm text-muted-foreground">No orders scheduled for this day.</div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="rounded border bg-white p-3 text-sm shadow-sm dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">#{o.order_number ?? o.id.slice(0,8)} – {o.customer_name}</div>
                  <Badge variant="secondary">{o.delivery_window}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Driver: {o.driver_name ?? 'Unassigned'} • Market: {o.market}</div>
                <div className="mt-2 grid grid-cols-6 gap-2 text-xs">
                  {[
                    { k: 'is_dispatched', label: 'D' },
                    { k: 'is_loaded', label: 'L' },
                    { k: 'is_notified', label: 'N' },
                    { k: 'is_delayed', label: 'De' },
                    { k: 'is_cancelled', label: 'C' },
                    { k: 'is_delivered', label: 'Dv' },
                  ].map(c => (
                    <label key={c.k} className="inline-flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" checked={Boolean(o[c.k])} onChange={(e)=>update(o.id, c.k, e.currentTarget.checked)} />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
