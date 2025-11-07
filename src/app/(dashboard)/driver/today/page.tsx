"use client"

import React from "react"
import { useTodayOrders } from "@/lib/hooks/useDriverOrders"
import { Card } from "@/components/ui/card"
import { OrderCard } from "@/components/driver/OrderCard"

export default function TodayDeliveriesPage() {
  const { data: orders, isLoading } = useTodayOrders()
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })

  const remaining = orders?.filter((o: any)=>o.status!=='delivered').length ?? 0
  const completed = orders?.filter((o: any)=>o.status==='delivered').length ?? 0
  const earnings = (orders?.reduce((s: number,o: any)=> s + (o.driver_pay||0), 0) ?? 0).toLocaleString(undefined,{style:'currency',currency:'USD'})

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Today's Deliveries</div>
        <div className="text-sm text-muted-foreground">{today} • {orders?.length ?? 0} orders</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="rounded-xl border p-3 text-center"><div className="text-xs text-muted-foreground">Remaining</div><div className="text-lg font-semibold">{remaining}</div></Card>
        <Card className="rounded-xl border p-3 text-center"><div className="text-xs text-muted-foreground">Completed</div><div className="text-lg font-semibold">{completed}</div></Card>
        <Card className="rounded-xl border p-3 text-center"><div className="text-xs text-muted-foreground">Earnings</div><div className="text-lg font-semibold">{earnings}</div></Card>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({length:4}).map((_,i)=> <Card key={i} className="h-28 animate-pulse" />)
        ) : !orders?.length ? (
          <Card className="p-6 text-center text-muted-foreground">No deliveries today</Card>
        ) : (
          orders.map((o: any)=> <OrderCard key={o.id} order={o} compact />)
        )}
      </div>
    </div>
  )
}
