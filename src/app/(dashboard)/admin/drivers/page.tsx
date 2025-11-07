"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DriversTable } from "@/components/drivers/DriversTable"
import { DriversCardView } from "@/components/drivers/DriversCardView"
import { AddDriverModal } from "@/components/drivers/AddDriverModal"
import { DriverLeaderboard } from "@/components/drivers/DriverLeaderboard"
import { useDrivers } from "@/lib/hooks/useDrivers"
import { Plus, List, Grid, Download } from "lucide-react"

export default function DriversPage() {
  const [view, setView] = useState<"table"|"card">('table')
  const [tab, setTab] = useState<'all'|'active'|'inactive'|'leaderboard'>('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'inactive'>('all')
  const [sort, setSort] = useState<'name_asc'|'name_desc'|'orders'|'recent'>('name_asc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [addOpen, setAddOpen] = useState(false)

  // derive status from tab
  const effStatus = useMemo(() => tab==='active' ? 'active' : tab==='inactive' ? 'inactive' : statusFilter, [tab, statusFilter])

  const { data, isLoading, refetch } = useDrivers({
    search,
    status: effStatus,
    sort,
    page,
    per_page: perPage,
  })

  const drivers = data?.data ?? []
  const total = data?.pagination?.total ?? drivers.length
  const activeCount = (data?.data ?? []).filter((d: any)=>d.is_active).length

  const totalDrivers = data?.summary?.total_drivers ?? total
  const activeDrivers = data?.summary?.active_drivers ?? activeCount
  const totalDeliveriesThisWeek = data?.summary?.total_orders_this_week ?? 0
  const avgOrdersPerDriver = totalDrivers ? Math.round((totalDeliveriesThisWeek/totalDrivers)*100)/100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Driver Management</h1>
          <p className="text-sm text-muted-foreground">{activeDrivers} active drivers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild size="sm">
            <a href="/api/export/drivers"><Download className="mr-1 h-4 w-4" /> Export</a>
          </Button>
          <Button className="h-10 gap-2" onClick={()=>setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add New Driver
          </Button>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title="Total Drivers" value={totalDrivers} />
        <StatCard title="Active Drivers" value={activeDrivers} />
        <StatCard title="Deliveries This Week" value={totalDeliveriesThisWeek} />
        <StatCard title="Avg Orders/Driver" value={avgOrdersPerDriver} />
      </div>

      {/* Filters & Search */}
      <Card className="rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input placeholder="Search drivers by name, email, or phone" value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1) }} />
          <select className="rounded border bg-background p-2 text-sm" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="rounded border bg-background p-2 text-sm" value={sort} onChange={(e)=>setSort(e.target.value as any)}>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="orders">Most Orders</option>
            <option value="recent">Recent Join Date</option>
          </select>
          <div className="flex items-center justify-end gap-2">
            <Button variant={view==='table'?'default':'outline'} size="sm" onClick={()=>setView('table')}><List className="mr-1 h-4 w-4" /> Table</Button>
            <Button variant={view==='card'?'default':'outline'} size="sm" onClick={()=>setView('card')}><Grid className="mr-1 h-4 w-4" /> Cards</Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v)=>{ setTab(v as any); setPage(1) }}>
        <TabsList>
          <TabsTrigger value="all">All Drivers</TabsTrigger>
          <TabsTrigger value="active">Active Only</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="leaderboard">Performance Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard" className="pt-4">
          <DriverLeaderboard />
        </TabsContent>
        <TabsContent value="all" className="pt-4">
          {view==='table' ? (
            <DriversTable isLoading={isLoading} data={drivers} total={total} page={page} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} onChanged={refetch} />
          ) : (
            <DriversCardView isLoading={isLoading} data={drivers} onChanged={refetch} />
          )}
        </TabsContent>
        <TabsContent value="active" className="pt-4">
          {view==='table' ? (
            <DriversTable isLoading={isLoading} data={drivers.filter((d:any)=>d.is_active)} total={drivers.filter((d:any)=>d.is_active).length} page={page} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} onChanged={refetch} />
          ) : (
            <DriversCardView isLoading={isLoading} data={drivers.filter((d:any)=>d.is_active)} onChanged={refetch} />
          )}
        </TabsContent>
        <TabsContent value="inactive" className="pt-4">
          {view==='table' ? (
            <DriversTable isLoading={isLoading} data={drivers.filter((d:any)=>!d.is_active)} total={drivers.filter((d:any)=>!d.is_active).length} page={page} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} onChanged={refetch} />
          ) : (
            <DriversCardView isLoading={isLoading} data={drivers.filter((d:any)=>!d.is_active)} onChanged={refetch} />
          )}
        </TabsContent>
      </Tabs>

      <AddDriverModal open={addOpen} onOpenChange={setAddOpen} onCreated={refetch} />
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string|number }) {
  return (
    <Card className="rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Card>
  )
}
