"use client"

import React, { useMemo, useState } from "react"
import { useAuth } from "@/lib/hooks/useAuth"
import { useDriverOrders, useDriverStats } from "@/lib/hooks/useDriverOrders"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Phone, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"
import { OrderCard } from "@/components/driver/OrderCard"

export default function DriverHomePage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<'all'|'dispatched'|'loaded'|'delivered'>('all')
  const [week, setWeek] = useState<'this'|'next'>('this')

  const { data: orders, isLoading } = useDriverOrders({ status: status==='all'? undefined: status, week })
  const { data: stats } = useDriverStats()

  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Hello, {user?.full_name || user?.email || 'Driver'}!</div>
        <div className="text-sm text-muted-foreground">{today}</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard title="Today" value={stats?.today_count ?? 0} subtitle="deliveries" />
        <StatCard title="This Week" value={stats?.week_count ?? 0} subtitle="deliveries" />
        <StatCard title="Earnings" value={(stats?.week_earnings ?? 0).toLocaleString(undefined,{style:'currency',currency:'USD'})} subtitle="this week" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Week</div>
        </div>
        <Tabs value={week} onValueChange={(v)=>setWeek(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="this">This Week <Badge variant="secondary" className="ml-1">{stats?.this_week_count ?? 0}</Badge></TabsTrigger>
            <TabsTrigger value="next">Next Week <Badge variant="secondary" className="ml-1">{stats?.next_week_count ?? 0}</Badge></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all','dispatched','loaded','delivered'] as const).map(s=> (
          <button key={s} onClick={()=>setStatus(s)} className={`rounded-full border px-3 py-1 text-sm ${status===s? 'bg-primary text-primary-foreground':'bg-background'}`}>{capitalize(s)}</button>
        ))}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({length:4}).map((_,i)=> <Card key={i} className="h-32 animate-pulse" />)
        ) : !orders?.length ? (
          <Card className="p-6 text-center text-muted-foreground">No deliveries scheduled</Card>
        ) : (
          orders.map((order: any)=> <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle }: { title: string; value: React.ReactNode; subtitle?: string }) {
  return (
    <Card className="rounded-xl border p-3">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
    </Card>
  )
}

function capitalize(s: string) { return s.charAt(0).toUpperCase()+s.slice(1) }
