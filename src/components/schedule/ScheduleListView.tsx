"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { formatFullDate } from "@/lib/utils/calendar"

export function ScheduleListView({ week, grouped, onOpenDay }: { week: 1|2; grouped: Record<string, any[]>; onOpenDay: (dateISO: string)=>void }) {
  const dates = Object.keys(grouped).sort()
  return (
    <div className="space-y-3">
      {dates.map((d) => (
        <Card key={d} className="rounded-xl border bg-white p-4 dark:bg-zinc-900">
          <div className="mb-2 text-sm font-semibold">{formatFullDate(new Date(d))} ({(grouped[d]??[]).length} orders)</div>
          <div className="space-y-2">
            {(grouped[d] ?? []).map((o) => (
              <div key={o.id} className="rounded border bg-gray-50 p-2 text-sm dark:bg-zinc-950">
                <span className="font-medium">#{o.order_number ?? o.id.slice(0,8)}</span> – Driver {o.driver_name ?? 'Unassigned'} – Customer {o.customer_name}
              </div>
            ))}
          </div>
          <div className="mt-2">
            <button className="text-xs text-blue-600 hover:underline" onClick={() => onOpenDay(d)}>Open day</button>
          </div>
        </Card>
      ))}
    </div>
  )
}
