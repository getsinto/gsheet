"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarView } from "@/components/schedule/CalendarView"
import { ScheduleListView } from "@/components/schedule/ScheduleListView"
import { DayDetailModal } from "@/components/schedule/DayDetailModal"
import { useScheduleStats, useWeekOrders } from "@/lib/hooks/useSchedule"
import { CreateOrderModal } from "@/components/orders/CreateOrderModal"
import { Download, List, Printer, Rows, Calendar as CalIcon, Plus } from "lucide-react"

export default function SchedulePage() {
  const [week, setWeek] = useState<1 | 2>(1)
  const [view, setView] = useState<"calendar" | "list">("calendar")
  const [createOpen, setCreateOpen] = useState(false)
  const [dayModal, setDayModal] = useState<{ open: boolean; date?: string }>({ open: false })

  const [driverIds, setDriverIds] = useState<string[]>([])
  const [statuses, setStatuses] = useState<Array<"dispatched"|"loaded"|"notified"|"delayed"|"cancelled"|"delivered">>([])
  const [hideDelivered, setHideDelivered] = useState(false)

  const filters = { driver_ids: driverIds, statuses, hideDelivered }

  const { data: grouped, refetch } = useWeekOrders(week, filters)
  const { data: stats } = useScheduleStats(week)

  // Compute date range string from grouped keys
  const dates = useMemo(() => Object.keys(grouped ?? {}).sort(), [grouped])
  const dateRange = useMemo(() => {
    if (!dates.length) return ""
    const start = new Date(dates[0])
    const end = new Date(dates[dates.length - 1])
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const year = end.getFullYear()
    return `${fmt(start)} - ${fmt(end)}, ${year}`
  }, [dates])

  const toggleStatus = (s: typeof statuses[number]) =>
    setStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const clearFilters = () => {
    setDriverIds([]); setStatuses([]); setHideDelivered(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Delivery Schedule</h1>
          <div className="text-sm text-muted-foreground">{dateRange}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === 'calendar' ? 'default' : 'outline'} size="sm" onClick={() => setView('calendar')}><CalIcon className="mr-1 h-4 w-4" /> Calendar</Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')}><List className="mr-1 h-4 w-4" /> List</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> Print Schedule</Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-4 w-4" /> Create Order</Button>
        </div>
      </div>

      {/* Week selector & stats */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={String(week)} onValueChange={(v) => setWeek(Number(v) as 1|2)}>
          <TabsList>
            <TabsTrigger value="1">Week 1</TabsTrigger>
            <TabsTrigger value="2">Week 2</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat title="Total Orders" value={stats?.total_orders ?? 0} />
          <Stat title="Orders Today" value={stats?.orders_today ?? 0} />
          <Stat title="Active Drivers" value={stats?.active_drivers ?? 0} />
          <Stat title="Completion" value={`${stats?.delivered_count ? Math.round((stats.delivered_count/(stats.total_orders||1))*100) : 0}%`} />
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-3">
          {/* Drivers (simple multi-select) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Drivers:</span>
            <DriverMultiSelect value={driverIds} onChange={setDriverIds} />
          </div>
          {/* Statuses */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            {(["dispatched","loaded","notified","delayed","cancelled","delivered"] as const).map((s) => (
              <Badge key={s} variant={statuses.includes(s) ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleStatus(s)}>
                {s}
              </Badge>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <label className="text-xs inline-flex items-center gap-2"><input type="checkbox" className="h-3 w-3" checked={hideDelivered} onChange={(e)=>setHideDelivered(e.currentTarget.checked)} /> Hide Delivered</label>
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear Filters</button>
          </div>
        </div>
      </Card>

      {/* Views */}
      {view === 'calendar' ? (
        <CalendarView week={week} grouped={grouped ?? {}} onOpenDay={(d)=>setDayModal({open:true, date:d})} onChanged={refetch} filters={filters} />
      ) : (
        <ScheduleListView week={week} grouped={grouped ?? {}} onOpenDay={(d)=>setDayModal({open:true, date:d})} />
      )}

      <DayDetailModal open={dayModal.open} dateISO={dayModal.date} onOpenChange={(v)=>setDayModal(p=>({...p, open:v}))} grouped={grouped ?? {}} onChanged={refetch} />
      <CreateOrderModal open={createOpen} onOpenChange={setCreateOpen} onCreated={refetch} />
    </div>
  )
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="rounded-lg border bg-white p-4 text-sm shadow-sm dark:bg-zinc-900">
      <div className="text-muted-foreground">{title}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </Card>
  )
}

function DriverMultiSelect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [choices, setChoices] = React.useState<{ id: string; full_name: string }[]>([])
  React.useEffect(() => { fetch('/api/drivers').then(r=>r.json()).then((j)=> setChoices((j && j.data) ? j.data : (Array.isArray(j)? j : []))).catch(()=>{}) }, [])
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter(x=>x!==id) : [...value, id])
  return (
    <div className="flex flex-wrap gap-2">
      {choices.map(d => (
        <Badge key={d.id} variant={value.includes(d.id) ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggle(d.id)}>{d.full_name}</Badge>
      ))}
    </div>
  )
}
