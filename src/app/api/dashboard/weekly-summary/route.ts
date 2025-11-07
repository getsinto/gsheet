import { NextRequest } from 'next/server'
import { requireAdmin, createRouteHandlerClient } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const { searchParams } = new URL(req.url)
    const weekParam = searchParams.get('week_number')
    const week_number = weekParam ? (Number(weekParam) as 1 | 2) : undefined

    const supabase = createRouteHandlerClient(req)

    let q = supabase.from('orders').select('*')
    if (week_number) q = q.eq('week_number', week_number)

    const { data, error: err } = await q
    if (err) return jsonError(err.message, 400)

    const orders = (data ?? []) as any[]
    const total_orders = orders.length
    const completed_orders = orders.filter((o) => o.status === 'delivered').length
    const completion_rate = total_orders ? Math.round((completed_orders / total_orders) * 10000) / 100 : 0
    const total_revenue = orders.reduce((s, o) => s + (o.status === 'delivered' ? Number(o.driver_pay ?? 0) : 0), 0)
    const total_miles = orders.reduce((s, o) => s + Number(o.miles ?? 0), 0)

    // by day
    const dayMap = new Map<string, number>()
    for (const o of orders) {
      const d = o.date as unknown as string
      dayMap.set(d, (dayMap.get(d) ?? 0) + 1)
    }
    const orders_by_day = Array.from(dayMap.entries()).sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, count]) => ({ date, count }))

    // by market
    const marketMap = new Map<string, number>()
    for (const o of orders) marketMap.set(o.market, (marketMap.get(o.market) ?? 0) + 1)
    const orders_by_market = Object.fromEntries(marketMap.entries())

    // top drivers
    const driverMap = new Map<string, { driver_name: string; count: number }>()
    for (const o of orders) {
      const key = o.driver_id ?? 'unassigned'
      const cur = driverMap.get(key) ?? { driver_name: o.driver_name ?? 'Unassigned', count: 0 }
      cur.count += 1
      driverMap.set(key, cur)
    }
    const top_drivers = Array.from(driverMap.values()).sort((a, b) => b.count - a.count).slice(0, 10)

    return jsonOk({ total_orders, completed_orders, completion_rate, total_revenue, total_miles, orders_by_day, orders_by_market, top_drivers })
  } catch (e: any) {
    return jsonError('Failed to compute weekly summary', 500)
  }
}
