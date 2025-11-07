import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api'
import { requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonError, parsePagination } from '@/lib/api/response'
import { parseOrderFilters } from '@/lib/api/filters'
import type { OrderStatus } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const { searchParams } = new URL(req.url)
    const filters = parseOrderFilters(searchParams)

    const supabase = createRouteHandlerClient(req)

    // Build base query with role filter
    let query = supabase.from('orders').select('*')
    if (current.role !== 'admin') query = query.eq('driver_id', current.id)

    if (filters.status && filters.status.length > 0) query = query.in('status', filters.status as OrderStatus[])
    if (filters.driver_id) query = query.eq('driver_id', filters.driver_id)
    if (filters.week_number) query = query.eq('week_number', filters.week_number)
    if (filters.start_date) query = query.gte('date', filters.start_date)
    if (filters.end_date) query = query.lte('date', filters.end_date)

    // Fetch all matching to aggregate in memory
    const { data, error } = await query
    if (error) return jsonError(error.message, 400)

    const total_orders = data.length
    const by_status = data.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1
      return acc
    }, {})
    const total_revenue = data.reduce((sum, o) => sum + Number(o.driver_pay ?? 0), 0)
    const average_miles = total_orders ? Math.round((data.reduce((s, o) => s + Number(o.miles ?? 0), 0) / total_orders) * 100) / 100 : 0
    const active_drivers = new Set(data.map((o) => o.driver_id).filter(Boolean)).size

    // Orders by day for the selected week (or overall range)
    const map = new Map<string, number>()
    for (const o of data) {
      const d = o.date as unknown as string
      map.set(d, (map.get(d) ?? 0) + 1)
    }
    const orders_by_day = Array.from(map.entries()).sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, count]) => ({ date, count }))

    return jsonOk({ total_orders, by_status, total_revenue, average_miles, active_drivers, orders_by_day })
  } catch (e: any) {
    return jsonError('Failed to compute stats', 500)
  }
}
