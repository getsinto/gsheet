"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateHeader } from "@/lib/utils/calendar"

function statusBorder(status: string) {
  const map: Record<string, string> = {
    dispatched: "border-l-yellow-400",
    loaded: "border-l-green-500",
    delayed: "border-l-orange-500",
    cancelled: "border-l-red-500",
    delivered: "border-l-gray-400 opacity-80",
  }
  return map[status] ?? "border-l-gray-300"
}

export function CalendarView({
  week,
  grouped,
  onOpenDay,
  onChanged,
  filters,
}: {
  week: 1 | 2
  grouped: Record<string, any[]>
  onOpenDay: (dateISO: string) => void
  onChanged: () => void
  filters: { driver_ids: string[]; statuses: string[]; hideDelivered: boolean }
}) {
  const dates = Object.keys(grouped).sort()

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-5 lg:grid-cols-7">
      {dates.map((d) => (
        <DayColumn key={d} dateISO={d} orders={grouped[d] ?? []} onOpen={() => onOpenDay(d)} />
      ))}
    </div>
  )
}

function DayColumn({ dateISO, orders, onOpen }: { dateISO: string; orders: any[]; onOpen: () => void }) {
  const date = new Date(dateISO)
  return (
    <Card className="flex min-h-[320px] flex-col rounded-xl border bg-gray-50 p-2 dark:bg-zinc-950">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">{formatDateHeader(date)}</div>
        <Badge variant="secondary">{orders.length}</Badge>
      </div>
      <div className="flex-1 space-y-2 overflow-auto">
        {orders.length === 0 ? (
          <div className="rounded border border-dashed p-4 text-center text-xs text-muted-foreground">No orders scheduled</div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className={`rounded border-l-4 bg-white p-2 text-xs shadow-sm dark:bg-zinc-900 ${statusBorder(o.status)}`}>
              <div className="flex items-center justify-between">
                <div className="font-semibold">{o.customer_name}</div>
                <Badge variant="secondary">{o.delivery_window}</Badge>
              </div>
              <div className="mt-1 text-muted-foreground">#{o.order_number ?? o.id.slice(0,8)} • {o.driver_name ?? 'Unassigned'}</div>
            </div>
          ))
        )}
      </div>
      <button className="mt-2 text-xs text-blue-600 hover:underline" onClick={onOpen}>View day</button>
    </Card>
  )
}
