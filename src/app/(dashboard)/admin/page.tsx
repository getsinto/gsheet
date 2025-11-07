"use client"

import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardStats, useRecentOrders } from "@/lib/hooks/useQueries"
import { ClipboardList, Users, DollarSign, Clock, CheckCircle2, AlertTriangle, Bell, MapPin, Send, Eye, Pencil, Trash2, Download, Plus, Calendar } from "lucide-react"

function StatCard({ title, value, icon: Icon, subtitle, className = "" }: { title: string; value: string | number; icon: React.ElementType; subtitle?: string; className?: string }) {
  return (
    <Card className={`group overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
          {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        <div className="rounded-lg bg-blue-600/10 p-3 text-blue-700 dark:text-blue-300"><Icon className="h-6 w-6" aria-hidden /></div>
      </div>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    dispatched: "bg-yellow-100 text-yellow-800",
    loaded: "bg-green-100 text-green-800",
    notified: "bg-emerald-100 text-emerald-800",
    delayed: "bg-orange-100 text-orange-800",
    cancelled: "bg-red-100 text-red-800",
    delivered: "bg-gray-200 text-gray-800",
  }
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100"}`}>{status}</span>
}

export default function AdminDashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useDashboardStats()
  const { data: recentData, isLoading: recentLoading } = useRecentOrders()

  const stats = statsData ?? {}
  const orders = recentData ?? []

  const pendingCount = (stats.total_orders ?? 0) - (stats.orders_by_status?.delivered ?? 0)

  const today = new Date().toLocaleDateString('en-US', { weekday: "long", month: "short", day: "numeric" })
  const week = stats?.orders_by_status ? (stats.current_week ?? undefined) : undefined

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        {typeof stats.current_week !== "undefined" && (
          <Badge variant="secondary">Week {stats.current_week}</Badge>
        )}
      </div>

      {/* Stats grid */}
      {statsLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-xl border bg-white p-5 dark:bg-zinc-900"><Skeleton className="h-16 w-full" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Orders" value={stats.total_orders ?? 0} icon={ClipboardList} subtitle="This week" />
          <StatCard title="Active Drivers" value={stats.active_drivers ?? 0} icon={Users} subtitle="Currently assigned" />
          <StatCard title="Total Revenue" value={`$${Number(stats.total_revenue ?? 0).toLocaleString()}`} icon={DollarSign} subtitle="This week" />
          <StatCard title="Pending Orders" value={pendingCount} icon={Clock} subtitle="Awaiting delivery" />
        </div>
      )}

      {/* Status overview */}
      <section>
        <h2 className="mb-3 text-xl font-semibold">Orders by Status</h2>
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (<Skeleton key={i} className="h-20 w-full rounded" />))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              { key: "dispatched", label: "Dispatched" },
              { key: "loaded", label: "Loaded" },
              { key: "notified", label: "Notified" },
              { key: "delayed", label: "Delayed" },
              { key: "cancelled", label: "Cancelled" },
              { key: "delivered", label: "Delivered" },
            ].map((s) => (
              <Card key={s.key} className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{s.label}</div>
                  <StatusBadge status={s.key} />
                </div>
                <div className="mt-2 text-2xl font-semibold">{stats.orders_by_status?.[s.key] ?? 0}</div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button className="h-12 gap-2" asChild>
            <Link href="/admin/orders/new"><Plus className="h-4 w-4" /> Create New Order</Link>
          </Button>
          <Button variant="outline" className="h-12 gap-2" asChild>
            <Link href="/admin/schedule"><Calendar className="h-4 w-4" /> View Schedule</Link>
          </Button>
          <Button variant="outline" className="h-12 gap-2" asChild>
            <Link href="/admin/drivers"><Users className="h-4 w-4" /> Manage Drivers</Link>
          </Button>
          <Button variant="outline" className="h-12 gap-2" asChild>
            <Link href="/api/export/orders"><Download className="h-4 w-4" /> Export Orders</Link>
          </Button>
        </div>
      </section>

      {/* Recent orders */}
      <section className="space-y-2">
        <div>
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <p className="text-sm text-muted-foreground">Last 10 orders</p>
        </div>
        <div className="overflow-x-auto rounded-lg border bg-white dark:bg-zinc-900">
          {recentLoading ? (
            <div className="p-6 space-y-2">
              {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-6 w-full" />))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No recent orders.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-950">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Order #</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Driver</th>
                  <th className="px-4 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id} className="border-t hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="px-4 py-3"><Link className="text-blue-600 hover:underline" href={`/admin/orders/${o.id}`}>{o.order_number ?? o.id.slice(0, 8)}</Link></td>
                    <td className="px-4 py-3">{o.date}</td>
                    <td className="px-4 py-3">{o.driver_name ?? "—"}</td>
                    <td className="px-4 py-3">{o.customer_name}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/orders/${o.id}`} aria-label="View details"><Eye className="h-4 w-4" /></Link>
                        <Link href={`/admin/orders/${o.id}/edit`} aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
                        <button aria-label="Send to Podium"><Send className="h-4 w-4" /></button>
                        <button className="text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Optional: simple weekly chart (SVG minimal, no extra deps) */}
      {Array.isArray(stats.orders_by_day) && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Orders This Week</h2>
          <div className="overflow-hidden rounded-lg border bg-white p-4 dark:bg-zinc-900">
            <MiniBarChart data={(stats.orders_by_day as any[]) ?? []} />
          </div>
        </section>
      )}
    </div>
  )
}

function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data || data.length === 0) return <div className="text-sm text-muted-foreground">No data</div>
  const max = Math.max(...data.map((d) => d.count)) || 1
  return (
    <div className="flex items-end gap-2" aria-label="Orders this week chart">
      {data.map((d) => (
        <div key={d.date} className="flex flex-col items-center gap-1">
          <div className="h-40 w-8 bg-gradient-to-t from-blue-200 to-blue-500" style={{ height: `${(d.count / max) * 160}px` }} />
          <div className="text-xs text-muted-foreground">{d.date.slice(5)}</div>
        </div>
      ))}
    </div>
  )
}
