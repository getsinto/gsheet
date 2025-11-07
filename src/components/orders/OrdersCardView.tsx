"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Lock } from "lucide-react"
import { toast } from "react-hot-toast"

export function OrdersCardView({
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
    return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{[...Array(6)].map((_, i) => (<Card key={i} className="h-40 rounded-lg border-2" />))}</div>
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {orders.map((o) => <CardItem key={o.id} order={o} selected={selected.has(o.id)} onToggleSelected={() => onToggleSelected(o.id)} onStatusChanged={onStatusChanged} />)}
    </div>
  )
}

function borderFor(status: string) {
  const map: Record<string, string> = {
    dispatched: "border-yellow-300",
    loaded: "border-green-300",
    delayed: "border-orange-300",
    cancelled: "border-red-300",
    delivered: "border-gray-300",
  }
  return map[status] ?? "border-gray-200"
}

function OrdersStatusRow({ order, locked, onStatusChanged }: { order: any; locked: boolean; onStatusChanged: () => void }) {
  const update = async (checkbox_name: string, checkbox_value: boolean) => {
    if (locked) return
    const prev = { ...order }
    try {
      order[checkbox_name] = checkbox_value
      const res = await fetch(`/api/orders/${order.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checkbox_name, checkbox_value }) })
      if (!res.ok) throw new Error(await res.text())
      toast.success('Status updated')
      onStatusChanged()
    } catch {
      toast.error('Failed to update status')
      Object.assign(order, prev)
    }
  }
  const C = ({k,label,title}:{k:string,label:string,title:string}) => (
    <label className="inline-flex items-center gap-2" title={title}>
      <input type="checkbox" className="h-4 w-4" checked={Boolean(order[k])} onChange={(e) => update(k, e.currentTarget.checked)} />
      <span className="text-xs">{label}</span>
    </label>
  )
  return (
    <div className={`mt-3 grid grid-cols-3 gap-2 text-xs ${locked ? 'pointer-events-none opacity-70' : ''}`}>
      <C k="is_dispatched" label="D" title="Dispatched" />
      <C k="is_loaded" label="L" title="Loaded" />
      <C k="is_notified" label="N" title="Notified" />
      <C k="is_delayed" label="De" title="Delayed" />
      <C k="is_cancelled" label="C" title="Cancelled" />
      <C k="is_delivered" label="Dv" title="Delivered" />
    </div>
  )
}

function CardItem({ order, selected, onToggleSelected, onStatusChanged }: { order: any; selected: boolean; onToggleSelected: () => void; onStatusChanged: () => void }) {
  const locked = Boolean(order.is_locked || order.status === 'delivered')
  return (
    <Card className={`rounded-lg border-2 p-4 ${borderFor(order.status)}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4" checked={selected} onChange={onToggleSelected} aria-label="Select order" />
            <div className="text-lg font-semibold">{order.order_number ?? order.id.slice(0,8)}</div>
            {locked && <Lock className="h-4 w-4 text-gray-500" aria-label="Locked" />}
          </div>
          <div className="text-xs text-muted-foreground">{order.date} • {order.delivery_window}</div>
        </div>
      </div>
      <div className="mt-2 text-sm">{order.driver_name ?? 'Unassigned'} • {order.customer_name}</div>
      <div className="text-xs text-muted-foreground">{order.pickup_city}, {order.pickup_state} → {order.customer_city}, {order.customer_state}</div>
      <OrdersStatusRow order={order} locked={locked} onStatusChanged={onStatusChanged} />
      <div className="mt-2 text-xs text-muted-foreground">Driver Pay: ${Number(order.driver_pay ?? 0).toFixed(2)} • Miles: {order.miles}</div>
    </Card>
  )
}
