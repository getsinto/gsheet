import { NextRequest } from 'next/server'
import { requireAdmin, createRouteHandlerClient } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const { searchParams } = new URL(req.url)
    const week_number = searchParams.get('week_number') ? Number(searchParams.get('week_number')) as 1 | 2 : undefined
    const start_date = searchParams.get('start_date') ?? undefined
    const end_date = searchParams.get('end_date') ?? undefined

    const supabase = createRouteHandlerClient(req)
    // Fetch necessary fields for all drivers and relevant orders
    const { data: drivers, error: uerr } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'driver')
      .eq('is_active', true)
    if (uerr) return jsonError(uerr.message, 400)

    const driverIds = ((drivers ?? []) as any[]).map((d) => d.id)
    if (driverIds.length === 0) return jsonOk([])

    let q = supabase.from('orders').select('driver_id,status,driver_pay,miles,date')
    if (week_number) q = q.eq('week_number', week_number)
    if (start_date) q = q.gte('date', start_date)
    if (end_date) q = q.lte('date', end_date)
    const { data: orders, error: oerr } = await q
    if (oerr) return jsonError(oerr.message, 400)

    const map = new Map<string, any>()
    for (const d of ((drivers ?? []) as any[])) {
      map.set(d.id, {
        driver_id: d.id,
        driver_name: d.full_name,
        total_orders: 0,
        completed_orders: 0,
        completion_rate: 0,
        total_miles: 0,
        total_earnings: 0,
        average_miles_per_order: 0,
        average_pay_per_order: 0,
        delayed_orders_count: 0,
        cancelled_orders_count: 0,
      })
    }

    for (const o of ((orders ?? []) as any[])) {
      const rec = map.get(o.driver_id as string)
      if (!rec) continue
      rec.total_orders += 1
      rec.total_miles += Number(o.miles ?? 0)
      rec.total_earnings += Number(o.driver_pay ?? 0)
      if (o.status === 'delivered') rec.completed_orders += 1
      if (o.status === 'delayed') rec.delayed_orders_count += 1
      if (o.status === 'cancelled') rec.cancelled_orders_count += 1
    }

    const result = Array.from(map.values()).map((r) => {
      r.completion_rate = r.total_orders ? Math.round((r.completed_orders / r.total_orders) * 10000) / 100 : 0
      r.average_miles_per_order = r.total_orders ? Math.round((r.total_miles / r.total_orders) * 100) / 100 : 0
      r.average_pay_per_order = r.total_orders ? Math.round((r.total_earnings / r.total_orders) * 100) / 100 : 0
      return r
    }).sort((a, b) => b.total_orders - a.total_orders)

    return jsonOk(result)
  } catch (e: any) {
    return jsonError('Failed to compute driver performance', 500)
  }
}
