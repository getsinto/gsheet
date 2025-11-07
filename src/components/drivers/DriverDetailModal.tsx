"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDriver, useDriverStats } from "@/lib/hooks/useDrivers"

export function DriverDetailModal({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (o:boolean)=>void }) {
  const { data } = useDriver(id)
  const { data: stats } = useDriverStats(id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Driver Details</DialogTitle>
        </DialogHeader>
        {!data ? (
          <div className="p-6 text-center text-muted-foreground">Loading…</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={data.avatar_url||''} />
                <AvatarFallback>{(data.name||data.email||'?').slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">{data.name||'Unnamed'}</div>
                <div className="text-sm text-muted-foreground">{data.email} • {data.phone||'-'}</div>
                <div className="mt-1"><Badge variant={data.is_active? 'default':'secondary'}>{data.is_active?'Active':'Inactive'}</Badge></div>
              </div>
            </div>

            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Role:</span> <span className="capitalize">{data.role}</span></div>
                <div><span className="text-muted-foreground">Joined:</span> {data.created_at? new Date(data.created_at).toLocaleString(): '-'}</div>
                <div><span className="text-muted-foreground">Earnings this week:</span> ${Number(stats?.earnings_this_week||0).toFixed(2)}</div>
              </TabsContent>
              <TabsContent value="performance">
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <MiniStat title="Orders (wk)" value={stats?.orders_this_week ?? 0} />
                  <MiniStat title="On-time % (wk)" value={`${Math.round((stats?.on_time_rate||0)*100)}%`} />
                  <MiniStat title="Avg/day (wk)" value={stats?.avg_orders_per_day ?? 0} />
                  <MiniStat title="Earnings (wk)" value={`$${Number(stats?.earnings_this_week||0).toFixed(2)}`} />
                </div>
                <div className="mt-4 text-sm text-muted-foreground">Charts coming soon…</div>
              </TabsContent>
              <TabsContent value="orders">
                <div className="text-sm text-muted-foreground">Recent orders listing coming soon…</div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MiniStat({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}
