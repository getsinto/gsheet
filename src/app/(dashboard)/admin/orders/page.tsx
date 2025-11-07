"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useOrderFilters } from "@/lib/hooks/useOrderFilters"
import { useOrders } from "@/lib/hooks/useOrders"
import { useNotifications } from "@/lib/hooks/useQueries"
import { OrdersTable } from "@/components/orders/OrdersTable"
import { OrdersCardView } from "@/components/orders/OrdersCardView"
import { BulkActionsBar } from "@/components/orders/BulkActionsBar"
import { CreateOrderModal } from "@/components/orders/CreateOrderModal"
import { Plus, List, Grid, Search } from "lucide-react"

export default function OrdersPage() {
  const [view, setView] = useState<"table" | "card">("table")
  const [createOpen, setCreateOpen] = useState(false)

  const filters = useOrderFilters()
  const { data, isLoading, refetch } = useOrders(filters.queryParams)
  const orders = data?.data ?? []
  const total = data?.pagination?.total ?? orders.length

  const selected = filters.selectedIds

  const weekBadge = useMemo(() => {
    const wk = filters.values.week_number
    return wk === 1 || wk === 2 ? wk : undefined
  }, [filters.values.week_number])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Orders Management</h1>
          {typeof weekBadge !== "undefined" && <Badge variant="secondary">Week {weekBadge}</Badge>}
        </div>
        <Button className="h-10 gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create New Order
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-9"
              value={filters.values.search}
              onChange={(e) => filters.setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status multi-select (simple checkboxes) */}
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Status</div>
              <div className="flex flex-wrap gap-2">
                {(["dispatched","loaded","notified","delayed","cancelled","delivered"] as const).map((s) => (
                  <label key={s} className={`inline-flex cursor-pointer items-center gap-1 rounded border px-2 py-1 text-xs ${filters.values.status.includes(s) ? "bg-blue-50 border-blue-200" : ""}`}>
                    <input
                      type="checkbox"
                      className="h-3 w-3"
                      checked={filters.values.status.includes(s)}
                      onChange={() => filters.toggleStatus(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            {/* Driver select */}
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Driver</div>
              <select
                className="w-full rounded border bg-background p-2 text-sm"
                value={filters.values.driver_id ?? ""}
                onChange={(e) => filters.setDriverId(e.target.value || undefined)}
              >
                <option value="">All Drivers</option>
                {(filters.drivers ?? []).map((d) => (
                  <option key={d.id} value={d.id}>{d.full_name}</option>
                ))}
              </select>
            </div>
            {/* Week filter */}
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Week</div>
              <select
                className="w-full rounded border bg-background p-2 text-sm"
                value={String(filters.values.week_number ?? "")}
                onChange={(e) => filters.setWeek(e.target.value ? Number(e.target.value) as 1|2 : undefined)}
              >
                <option value="">All</option>
                <option value="1">Week 1</option>
                <option value="2">Week 2</option>
              </select>
            </div>
            {/* Date range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">Start</div>
                <input type="date" className="w-full rounded border bg-background p-2 text-sm" value={filters.values.start_date ?? ""} onChange={(e) => filters.setStartDate(e.target.value || undefined)} />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">End</div>
                <input type="date" className="w-full rounded border bg-background p-2 text-sm" value={filters.values.end_date ?? ""} onChange={(e) => filters.setEndDate(e.target.value || undefined)} />
              </div>
            </div>
          </div>
          {/* Active filters + controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {filters.activeFilters.map((f) => (
                <Badge key={f.key+":"+String(f.value)} variant="secondary" className="gap-2">
                  {f.label}
                  <button aria-label="Remove filter" onClick={() => filters.removeFilter(f.key)} className="text-xs">✕</button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Showing {total} orders</span>
              <button onClick={filters.reset} className="text-blue-600 hover:underline">Clear All Filters</button>
            </div>
          </div>
        </div>
      </Card>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <BulkActionsBar selectedIds={[...selected]} onDone={() => { filters.clearSelection(); refetch() }} />
      )}

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{orders.length} results</div>
        <div className="flex items-center gap-1">
          <Button variant={view === "table" ? "default" : "outline"} size="sm" onClick={() => setView("table")}>
            <List className="mr-1 h-4 w-4" /> Table
          </Button>
          <Button variant={view === "card" ? "default" : "outline"} size="sm" onClick={() => setView("card")}>
            <Grid className="mr-1 h-4 w-4" /> Card
          </Button>
        </div>
      </div>

      {/* Orders list */}
      {view === "table" ? (
        <OrdersTable
          isLoading={isLoading}
          orders={orders}
          selected={filters.selectedIds}
          onToggleSelected={filters.toggleSelected}
          onStatusChanged={() => refetch()}
        />
      ) : (
        <OrdersCardView
          isLoading={isLoading}
          orders={orders}
          selected={filters.selectedIds}
          onToggleSelected={filters.toggleSelected}
          onStatusChanged={() => refetch()}
        />
      )}

      <CreateOrderModal open={createOpen} onOpenChange={setCreateOpen} onCreated={() => refetch()} />
    </div>
  )
}
