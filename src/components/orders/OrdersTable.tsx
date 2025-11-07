"use client"

import React, { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Send, Copy, Plus, Trash2, MoreHorizontal, Lock } from "lucide-react"
import { toast } from "react-hot-toast"

function rowClasses(status: string, locked: boolean) {
  const base = "transition hover:shadow-sm hover:scale-[1.002]"
  const map: Record<string, string> = {
    dispatched: "bg-yellow-50 border-yellow-300",
    loaded: "bg-green-50 border-green-300",
    delayed: "bg-orange-50 border-orange-300",
    cancelled: "bg-red-50 border-red-300",
    delivered: "bg-gray-100 border-gray-300 text-gray-500",
  }
  return `border-2 rounded-lg p-4 ${base} ${map[status] ?? "border-gray-200"} ${locked ? "opacity-80" : ""}`
}

export function OrdersTable({
  isLoading,
  orders,
  selected,
  onToggleSelected,
  onStatusChanged,
}: {
  isLoading: boolean
  orders: any[]
  selected: Set<string>
  onToggleSelected: (id: string) => void
  onStatusChanged: () => void
}) {
  if (isLoading) {
    return <div className="space-y-3">{[...Array(5)].map((_, i) => (<Card key={i} className="h-24 rounded-lg border-2" />))}</div>
  }
  return (
    <div className="space-y-3">
      {orders.map((o) => <Row key={o.id} order={o} selected={selected.has(o.id)} onToggleSelected={() => onToggleSelected(o.id)} onStatusChanged={onStatusChanged} />)}
    </div>
  )
}

function Row({ order, selected, onToggleSelected, onStatusChanged }: { order: any; selected: boolean; onToggleSelected: () => void; onStatusChanged: () => void }) {
  const locked = Boolean(order.is_locked || order.status === 'delivered')
  const cls = useMemo(() => rowClasses(order.status, locked), [order.status, locked])

  const updateStatus = async (checkbox_name: string, checkbox_value: boolean) => {
    if (locked) return
    const prev = { ...order }
    try {
      // optimistic
      order[checkbox_name] = checkbox_value
      const { data } = await (await import('@/lib/supabase/browser')).createBrowserClient().auth.getSession()
      const token = data.session?.access_token
      const headers: Record<string,string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ checkbox_name, checkbox_value }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success('Status updated')
      onStatusChanged()
    } catch (e: any) {
      toast.error('Failed to update status')
      Object.assign(order, prev)
    }
  }

  const actions = [
    { key: 'view', label: 'View Details', icon: Eye },
    { key: 'edit', label: 'Edit Order', icon: Pencil },
    { key: 'podium', label: 'Send to Podium', icon: Send },
    { key: 'duplicate', label: 'Duplicate', icon: Copy },
    { key: 'add', label: 'Add Another Delivery', icon: Plus },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true },
  ]

  return (
    <div className={cls}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <input type="checkbox" className="h-4 w-4" checked={selected} onChange={onToggleSelected} aria-label="Select order" />
          <div className="space-y-1">
            <div className="text-sm font-semibold">{order.order_number ?? order.id.slice(0,8)}</div>
            <div className="text-xs text-muted-foreground">{order.date} • {order.delivery_window}</div>
            <div className="text-xs">{order.driver_name ?? 'Unassigned'} • {order.customer_name} • {order.market}</div>
            <div className="text-xs text-muted-foreground">{order.pickup_city}, {order.pickup_state} → {order.customer_city}, {order.customer_state}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {locked && <Lock className="h-4 w-4 text-gray-500" aria-label="Locked" />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1"><MoreHorizontal className="h-4 w-4" /> Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {actions.map(a => (
                <DropdownMenuItem key={a.key} className={a.danger ? 'text-red-600 focus:text-red-600' : ''}>
                  <a className="flex w-full items-center gap-2" href="#"><a.icon className="h-4 w-4" /> {a.label}</a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Inline status checkboxes */}
      <div className={`mt-3 grid grid-cols-6 items-center gap-2 text-xs ${locked ? 'pointer-events-none opacity-70' : ''}`}>
        {[
          { k: 'is_dispatched', label: 'D', title: 'Dispatched' },
          { k: 'is_loaded', label: 'L', title: 'Loaded' },
          { k: 'is_notified', label: 'N', title: 'Notified' },
          { k: 'is_delayed', label: 'De', title: 'Delayed' },
          { k: 'is_cancelled', label: 'C', title: 'Cancelled' },
          { k: 'is_delivered', label: 'Dv', title: 'Delivered' },
        ].map((c) => (
          <label key={c.k} className="inline-flex items-center gap-2" title={c.title}>
            <input type="checkbox" className="h-4 w-4" checked={Boolean(order[c.k])} onChange={(e) => updateStatus(c.k, e.currentTarget.checked)} />
            <span>{c.label}</span>
          </label>
        ))}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">Driver Pay: ${Number(order.driver_pay ?? 0).toFixed(2)} • Miles: {order.miles}</div>
    </div>
  )
}
