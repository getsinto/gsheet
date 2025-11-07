import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)

    // Only self or admin
    if (current.role !== 'admin' && current.id !== id) return jsonError('Forbidden', 403)

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('driver_id', id)

    if (error) return jsonError(error.message, 400)

    const total_orders = orders?.length ?? 0
    const orders_by_status = orders?.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1
      return acc
    }, {}) ?? {}
    const completed_orders = orders?.filter((o) => o.status === 'delivered').length ?? 0
    const cancelled_orders = orders?.filter((o) => o.status === 'cancelled').length ?? 0
    const total_earnings = orders?.reduce((s, o) => s + Number(o.driver_pay ?? 0), 0) ?? 0
    const total_miles = orders?.reduce((s, o) => s + Number(o.miles ?? 0), 0) ?? 0
    const average_pay_per_order = total_orders ? Number((total_earnings / total_orders).toFixed(2)) : 0
    const average_miles_per_order = total_orders ? Number((total_miles / total_orders).toFixed(2)) : 0

    const now = new Date()
    const iso = (d: Date) => d.toISOString().slice(0, 10)

    const startOfWeek = new Date(now)
    const day = startOfWeek.getUTCDay() || 7
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - day + 1)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6)

    const orders_this_week = orders?.filter((o) => o.date >= iso(startOfWeek) && o.date <= iso(endOfWeek)).length ?? 0
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
    const orders_this_month = orders?.filter((o) => o.date >= iso(startOfMonth) && o.date <= iso(endOfMonth)).length ?? 0

    const orders_by_market = orders?.reduce<Record<string, number>>((acc, o) => {
      acc[o.market] = (acc[o.market] ?? 0) + 1
      return acc
    }, {}) ?? {}

    const weekdayCount = new Array(7).fill(0) as number[]
    for (const o of orders ?? []) {
      const d = new Date(o.date as unknown as string)
      weekdayCount[d.getUTCDay()]++
    }
    const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const busiest_day_of_week = weekdays[weekdayCount.indexOf(Math.max(...weekdayCount))] ?? 'Mon'

    // Simple performance trend by ISO week (last 8)
    const map = new Map<string, { orders: number; earnings: number }>()
    for (const o of orders ?? []) {
      const d = new Date(o.date as unknown as string)
      const year = d.getUTCFullYear()
      const onejan = new Date(Date.UTC(year, 0, 1))
      const week = Math.ceil((((d as any) - (onejan as any)) / 86400000 + onejan.getUTCDay() + 1) / 7)
      const key = `${year}-W${week}`
      const cur = map.get(key) ?? { orders: 0, earnings: 0 }
      cur.orders += 1
      cur.earnings += Number(o.driver_pay ?? 0)
      map.set(key, cur)
    }
    const performance_trend = Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-8)
      .map(([week, v]) => ({ week, orders: v.orders, earnings: Number(v.earnings.toFixed(2)) }))

    return jsonOk({
      total_orders,
      orders_by_status,
      completed_orders,
      cancelled_orders,
      total_earnings,
      total_miles,
      average_pay_per_order,
      average_miles_per_order,
      orders_this_week,
      orders_this_month,
      orders_by_market,
      busiest_day_of_week,
      on_time_delivery_rate: null,
      performance_trend,
    })
  } catch (e: any) {
    return jsonError('Failed to fetch user stats', 500)
  }
}
