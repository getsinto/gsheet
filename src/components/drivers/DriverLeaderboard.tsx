"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useDriverPerformance } from "@/lib/hooks/useDrivers"

export function DriverLeaderboard() {
  const { data, isLoading } = useDriverPerformance({ range: 'week' })
  const items = data?.data ?? []
  return (
    <Card className="overflow-hidden">
      <div className="border-b p-4 text-sm font-medium">Top performers (this week)</div>
      <div className="divide-y">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">Loading…</div>
        ) : items.length===0 ? (
          <div className="p-6 text-center text-muted-foreground">No data</div>
        ) : (
          items.map((it:any, idx:number)=> (
            <div key={it.id} className="grid grid-cols-12 items-center gap-3 p-3">
              <div className="col-span-1 text-right text-sm text-muted-foreground">#{idx+1}</div>
              <div className="col-span-3 truncate text-sm">{it.name||it.email}</div>
              <div className="col-span-2 text-sm">{it.orders_this_week} orders</div>
              <div className="col-span-4">
                <Progress value={Math.min(100, (it.orders_this_week || 0) * 5)} />
              </div>
              <div className="col-span-2 text-right text-sm font-medium">${Number(it.earnings_this_week||0).toFixed(2)}</div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
